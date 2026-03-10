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

// DASHBOARD
if (window.location.href.includes('dashboard')) {
    const loadDashboard = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            window.location.href = 'login.html'
            return
        }

        // Update welcome message
        const welcomeMsg = document.querySelector('.dashboard-header h1')
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome back, ${user.user_metadata.full_name || 'Artist'} 🔥`
        }

        // Load releases
        const { data: releases } = await supabase
            .from('releases')
            .select('*')
            .eq('user_id', user.id)

        if (releases) {
            // Update releases count
            const statNumbers = document.querySelectorAll('.stat-number')
            if (statNumbers[2]) {
                statNumbers[2].textContent = releases.length
            }

            // Update total streams
            const totalStreams = releases.reduce((sum, r) => sum + (r.streams || 0), 0)
            if (statNumbers[0]) {
                statNumbers[0].textContent = totalStreams.toLocaleString()
            }

            // Update recent releases
            const releasesList = document.querySelector('.releases')
            if (releasesList && releases.length > 0) {
                releasesList.innerHTML = releases.map(r => `
                    <div class="release-item">
                        <div class="release-art">🎵</div>
                        <div class="release-info">
                            <p class="release-title">${r.title}</p>
                            <p class="release-meta">${r.release_type} • ${r.release_date}</p>
                        </div>
                        <div class="release-streams">${(r.streams || 0).toLocaleString()} streams</div>
                    </div>
                `).join('')
            } else if (releasesList) {
                releasesList.innerHTML = '<p style="color:#888">No releases yet. <a href="upload.html" style="color:#ff4500">Upload your first track!</a></p>'
            }
        }
    }

    loadDashboard()
}