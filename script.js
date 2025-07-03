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
    
    // Resetar erros anteriores
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.checkbox-group').forEach(el => el.classList.remove('error'));
    document.getElementById('errorContainer').classList.remove('show');
    
    const errorList = document.getElementById('errorList');
    errorList.innerHTML = '';
    const errors = [];
    
    // Validar cada questão (1-6)
    for (let i = 1; i <= 6; i++) {
        const checkboxes = form.querySelectorAll(`input[name="q${i}"]:checked`);
        const otherInput = form.querySelector(`input[name="q${i}_other"]`);
        let hasError = false;
        
        if (checkboxes.length === 0) {
            errors.push(`Pergunta ${i}: Selecione pelo menos uma opção`);
            hasError = true;
        } else if (Array.from(checkboxes).some(cb => cb.value === "Outros") && (!otherInput || otherInput.value.trim() === '')) {
            errors.push(`Pergunta ${i}: O campo "Outros" deve ser preenchido`);
            hasError = true;
        }
        
        if (hasError) {
            const questionDiv = document.querySelector(`input[name="q${i}"]`).closest('.form-section');
            let errorMsg = questionDiv.querySelector('.error-message');
            
            if (!errorMsg) {
                errorMsg = document.createElement('p');
                errorMsg.className = 'error-message';
                questionDiv.querySelector('.checkbox-group').after(errorMsg);
            }
            
            errorMsg.textContent = 'Campo obrigatório';
            errorMsg.style.display = 'block';
            questionDiv.querySelector('.checkbox-group').classList.add('error');
        }
    }
    
    // Validar campo de comentários (se quiser tornar obrigatório)
    const comments = form.querySelector('textarea[name="comments"]');
    if (comments.value.trim() === '') {
        errors.push('Comentários: Este campo é obrigatório');
        comments.classList.add('error');
    }
    
    // Mostrar erros se existirem
    if (errors.length > 0) {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.classList.add('show');
        
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        
        // Rolar até o topo dos erros
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    
    // Se não houver erros, processar o envio
    const formData = new FormData(form);
    const responseData = {};
    
    // ... (resto do código de processamento que você já tinha) ...
    
    // Mostrar mensagem de sucesso
    successMessage.style.display = 'block';
    form.reset();
    
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
    }); // <-- Esta chave estava faltando

    // Auto-check "Outros" quando o campo é preenchido
    document.querySelectorAll('[name$="_other"]').forEach(otherInput => {
        otherInput.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                // Encontra o checkbox "Outros" correspondente
                const correspondingCheckbox = this.previousElementSibling;
                if (correspondingCheckbox && correspondingCheckbox.type === 'checkbox') {
                    correspondingCheckbox.checked = true;
                }
            }
        });
    });
});
