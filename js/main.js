import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// SIGN UP
const signupBtn = document.querySelector('.auth-box button')

if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
        const name = document.querySelectorAll('.auth-box input')[0].value
        const email = document.querySelectorAll('.auth-box input')[1].value
        const password = document.querySelectorAll('.auth-box input')[2].value

        if (!name || !email || !password) {
            alert('Please fill in all fields')
            return
        }

        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: name }
            }
        })

        if (error) {
            alert(error.message)
        } else {
            alert('Account created! Please check your email to confirm.')
        }
    })
}

// LOGIN
const loginBtn = document.querySelector('.auth-box button')

if (loginBtn && window.location.href.includes('login')) {
    loginBtn.addEventListener('click', async () => {
        const email = document.querySelectorAll('.auth-box input')[0].value
        const password = document.querySelectorAll('.auth-box input')[1].value

        if (!email || !password) {
            alert('Please fill in all fields')
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) {
            alert(error.message)
        } else {
            window.location.href = 'dashboard.html'
        }
    })
}