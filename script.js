document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const form = document.getElementById('surveyForm');
    const errorContainer = document.getElementById('errorContainer');
    const errorList = document.getElementById('errorList');
    const successMessage = document.getElementById('successMessage');
    const adminAccessBtn = document.getElementById('adminAccessBtn');
    const adminModal = document.getElementById('adminModal');
    const closeModal = document.querySelector('.close');
    const viewResponsesBtn = document.getElementById('viewResponsesBtn');
    const adminPassword = document.getElementById('adminPassword');
    const responsesContainer = document.getElementById('responsesContainer');
    const responsesList = document.getElementById('responsesList');
    const exportCSVBtn = document.getElementById('exportCSVBtn');
    const clearResponsesBtn = document.getElementById('clearResponsesBtn');

    // Banco de dados local
    let responses = JSON.parse(localStorage.getItem('aquastarResponses')) || [];
    const SENHA_ADMIN = "Aqua@2025"; // Senha para acessar as respostas

    // Auto-check "Outros" quando digitar no campo
    document.querySelectorAll('[name$="_other"]').forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                const checkbox = this.previousElementSibling;
                if (checkbox && checkbox.type === 'checkbox') {
                    checkbox.checked = true;
                }
            }
        });
    });

    // Validação do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Resetar erros
        resetErrors();
        
        const errors = validateForm();

        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        saveResponse();
    });

    // Funções de administração
    adminAccessBtn.addEventListener('click', function() {
        adminModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        adminModal.style.display = 'none';
        responsesContainer.style.display = 'none';
        adminPassword.value = '';
    });

    viewResponsesBtn.addEventListener('click', function() {
        if (adminPassword.value === SENHA_ADMIN) {
            displayResponses();
            responsesContainer.style.display = 'block';
        } else {
            alert('Senha incorreta!');
        }
    });

    exportCSVBtn.addEventListener('click', exportToCSV);
    clearResponsesBtn.addEventListener('click', clearResponses);

    // Funções auxiliares
    function resetErrors() {
        errorContainer.classList.remove('show');
        errorList.innerHTML = '';
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.checkbox-group').forEach(el => el.classList.remove('error'));
    }

    function validateForm() {
        const errors = [];

        for (let i = 1; i <= 6; i++) {
            const checkboxes = form.querySelectorAll(`input[name="q${i}"]:checked`);
            const otherInput = form.querySelector(`input[name="q${i}_other"]`);
            
            if (checkboxes.length === 0) {
                errors.push(`Pergunta ${i}: Selecione pelo menos uma opção`);
                highlightError(`q${i}`);
            } 
            else if (Array.from(checkboxes).some(cb => cb.value === "Outros") && (!otherInput || otherInput.value.trim() === '')) {
                errors.push(`Pergunta ${i}: O campo "Outros" deve ser preenchido`);
                highlightError(`q${i}`);
            }
        }

        return errors;
    }

    function highlightError(questionName) {
        const firstCheckbox = document.querySelector(`input[name="${questionName}"]`);
        if (firstCheckbox) {
            const questionDiv = firstCheckbox.closest('.form-section');
            const checkboxGroup = questionDiv.querySelector('.checkbox-group');
            checkboxGroup.classList.add('error');
            
            let errorMsg = questionDiv.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('p');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Campo obrigatório';
                checkboxGroup.after(errorMsg);
            }
            errorMsg.style.display = 'block';
        }
    }

    function showErrors(errors) {
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        
        errorContainer.classList.add('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function saveResponse() {
        const formData = new FormData(form);
        const responseData = {};

        for (let i = 1; i <= 6; i++) {
            const checkboxes = form.querySelectorAll(`input[name="q${i}"]:checked`);
            responseData[`question${i}`] = Array.from(checkboxes).map(cb => cb.value);
            
            const otherInput = form.querySelector(`input[name="q${i}_other"]`);
            if (otherInput && otherInput.value.trim() !== '' && responseData[`question${i}`].includes('Outros')) {
                const index = responseData[`question${i}`].indexOf('Outros');
                responseData[`question${i}`][index] = `Outros: ${otherInput.value.trim()}`;
            }
        }

        responseData.comments = formData.get('comments');
        responseData.timestamp = new Date().toISOString();
        
        responses.push(responseData);
        localStorage.setItem('aquastarResponses', JSON.stringify(responses));
        
        showSuccessMessage();
    }

    function showSuccessMessage() {
        successMessage.style.display = 'block';
        form.reset();
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }

    function displayResponses() {
        responsesList.innerHTML = '';
        
        if (responses.length === 0) {
            responsesList.innerHTML = '<p>Nenhuma resposta encontrada.</p>';
            return;
        }
        
        responses.forEach((response, index) => {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'response-item';
            
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

    function exportToCSV() {
        if (responses.length === 0) {
            alert('Nenhuma resposta para exportar!');
            return;
        }
        
        let csv = 'Timestamp;';
        
        // Cabeçalhos
        for (let i = 1; i <= 6; i++) {
            csv += `Pergunta ${i};`;
        }
        csv += 'Comentários\n';
        
        // Dados
        responses.forEach(response => {
            csv += `${response.timestamp};`;
            
            for (let i = 1; i <= 6; i++) {
                csv += `"${(response[`question${i}`] || []).join(', ')}";`;
            }
            
            csv += `"${response.comments || ''}"\n`;
        });
        
        // Criar link de download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aquastar_respostas_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function clearResponses() {
        if (confirm('Tem certeza que deseja apagar TODAS as respostas? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('aquastarResponses');
            responses = [];
            responsesList.innerHTML = '<p>Nenhuma resposta encontrada.</p>';
        }
    }
});
