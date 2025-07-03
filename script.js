document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const adminAccessBtn = document.getElementById('adminAccessBtn');
    const adminModal = document.getElementById('adminModal');
    const closeModal = document.querySelector('.close');
    const viewResponsesBtn = document.getElementById('viewResponsesBtn');
    const adminPassword = document.getElementById('adminPassword');
    const responsesContainer = document.getElementById('responsesContainer');
    const responsesList = document.getElementById('responsesList');
    const exportCSVBtn = document.getElementById('exportCSVBtn');
    const clearResponsesBtn = document.getElementById('clearResponsesBtn');
    const successMessage = document.getElementById('successMessage');

    // Load responses from localStorage
    let responses = JSON.parse(localStorage.getItem('aquastarResponses')) || [];

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get all form data
        const formData = new FormData(form);
        const responseData = {};
        
        // Process checkboxes
        for (let i = 1; i <= 6; i++) {
            const checkboxes = form.querySelectorAll(`input[name="q${i}"]:checked`);
            responseData[`question${i}`] = Array.from(checkboxes).map(cb => cb.value);
            
            // Process "other" text
            const otherInput = form.querySelector(`input[name="q${i}_other"]`);
            if (otherInput && otherInput.value.trim() !== '') {
                responseData[`question${i}`].push(`Outros: ${otherInput.value.trim()}`);
            }
        }
        
        // Process comments
        responseData.comments = formData.get('comments');
        
        // Add timestamp
        responseData.timestamp = new Date().toISOString();
        
        // Save response
        responses.push(responseData);
        localStorage.setItem('aquastarResponses', JSON.stringify(responses));
        
        // Show success message
        successMessage.style.display = 'block';
        form.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    });

    // Admin access
    adminAccessBtn.addEventListener('click', function() {
        adminModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        adminModal.style.display = 'none';
        responsesContainer.style.display = 'none';
        adminPassword.value = '';
    });

    window.addEventListener('click', function(event) {
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
            responsesContainer.style.display = 'none';
            adminPassword.value = '';
        }
    });

    // View responses
    viewResponsesBtn.addEventListener('click', function() {
        if (adminPassword.value === 'Aqua@2025') {
            displayResponses();
            responsesContainer.style.display = 'block';
        } else {
            alert('Senha incorreta!');
        }
    });

    function displayResponses() {
        responsesList.innerHTML = '';
        
        if (responses.length === 0) {
            responsesList.innerHTML = '<p>Nenhuma resposta encontrada.</p>';
            return;
        }
        
        responses.forEach((response, index) => {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-item';
            responseDiv.style.marginBottom = '20px';
            responseDiv.style.padding = '15px';
            responseDiv.style.backgroundColor = '#333';
            responseDiv.style.borderRadius = '4px';
            
            let html = `<h4>Resposta #${index + 1} - ${new Date(response.timestamp).toLocaleString()}</h4>`;
            
            for (let i = 1; i <= 6; i++) {
                if (response[`question${i}`] && response[`question${i}`].length > 0) {
                    html += `<p><strong>Pergunta ${i}:</strong> ${response[`question${i}`].join(', ')}</p>`;
                }
            }
            
            if (response.comments) {
                html += `<p><strong>Comentários:</strong> ${response.comments}</p>`;
            }
            
            responseDiv.innerHTML = html;
            responsesList.appendChild(responseDiv);
        });
    }

    // Export to CSV
    exportCSVBtn.addEventListener('click', function() {
        if (responses.length === 0) {
            alert('Nenhuma resposta para exportar!');
            return;
        }
        
        let csv = 'Timestamp;';
        
        // Add headers
        for (let i = 1; i <= 6; i++) {
            csv += `Pergunta ${i};`;
        }
        csv += 'Comentários\n';
        
        // Add data
        responses.forEach(response => {
            csv += `${response.timestamp};`;
            
            for (let i = 1; i <= 6; i++) {
                csv += `"${(response[`question${i}`] || []).join(', ')}";`;
            }
            
            csv += `"${response.comments || ''}"\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aquastar_respostas_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Clear responses
    clearResponsesBtn.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja apagar todas as respostas? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('aquastarResponses');
            responses = [];
            responsesList.innerHTML = '<p>Nenhuma resposta encontrada.</p>';
        }
    });
});
