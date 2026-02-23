document.addEventListener("DOMContentLoaded", ()=> {

    const API = 'http://localhost:3000'

    const formLogin = document.getElementById('formLogin')
    const formCadastro = document.getElementById('formCadastro')

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
    
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
    
            try {
    
                const res = await fetch(`${API}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email, senha: senha })
                })
    
                const data = await res.text();
    
                alert(data);

                if (res.status == 200) {
                    localStorage.setItem('isLogged', true);
                    localStorage.setItem('email', email);
                    window.location.href = 'index.html'
                }
    
            } catch (err) {
                alert('Erro ao efetuar o Login!\nTente novamente mais tarde!')
                console.error('Erro ao efetuar o login!' + err)
            }
        })
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
    
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
    
            try {
    
                const res = await fetch(`${API}/resgitrar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: nome, email: email, senha: senha })
                })
    
                const data = await res.json();
    
                alert(data.mensagem);
    
            } catch (err) {
                alert('Erro ao efetuar o Login!\nTente novamente mais tarde!')
                console.error('Erro ao efetuar o login!' + err)
            }
        })        
    }

    if (window.location.pathname.includes("index.html")) {
        if (!localStorage.getItem('isLogged')) {
            alert('Você não está logado! Faça o login!');
            window.location.href = 'login.html'
        }

        const user = document.getElementById('user');
        user.style.color = 'green';
        user.innerHTML = localStorage.getItem('email');
    }

})