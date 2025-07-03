document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const errorContainer = document.getElementById('errorContainer');
    const errorList = document.getElementById('errorList');
    const successMessage = document.getElementById('successMessage');
    let responses = JSON.parse(localStorage.getItem('aquastarResponses')) || [];

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
        errorContainer.classList.remove('show');
        errorList.innerHTML = '';
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.checkbox-group').forEach(el => el.classList.remove('error'));
        
        const errors = [];

        // Validar cada questão (1-6)
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

        // Mostrar erros se existirem
        if (errors.length > 0) {
            errors.forEach(error => {
                const li = document.createElement('li');
                li.textContent = error;
                errorList.appendChild(li);
            });
            
            errorContainer.classList.add('show');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Processar envio se válido
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
        
        successMessage.style.display = 'block';
        form.reset();
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    });

    // Função para destacar erros
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
});
