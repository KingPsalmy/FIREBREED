import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// SIGN UP
const signupBtn = document.querySelector('.auth-box button')

if (signupBtn && window.location.href.includes('signup')) {
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
if (signupBtn && window.location.href.includes('login')) {
    signupBtn.addEventListener('click', async () => {
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

// STRIPE PAYMENTS
const artistPlanBtn = document.getElementById('artist-plan')
const labelPlanBtn = document.getElementById('label-plan')
const freePlanBtn = document.getElementById('free-plan')

if (freePlanBtn) {
    freePlanBtn.addEventListener('click', () => {
        window.location.href = 'signup.html'
    })
}

if (artistPlanBtn) {
    artistPlanBtn.addEventListener('click', () => {
        window.location.href = 'https://buy.stripe.com/test_00w00lgtq6mV4Ei7uK7Re00'
    })
}

if (labelPlanBtn) {
    labelPlanBtn.addEventListener('click', () => {
        window.location.href = 'https://buy.stripe.com/test_4gM00la5226F6Mq2aq7Re01'
    })
}