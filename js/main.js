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

// PAYSTACK PAYMENTS
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
        const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: 'customer@email.com',
            plan: 'PLN_rldpe6fcx1545o5',
            callback: function(response) {
                window.location.href = 'dashboard.html'
            },
            onClose: function() {
                alert('Payment cancelled')
            }
        })
        handler.openIframe()
    })
}

if (labelPlanBtn) {
    labelPlanBtn.addEventListener('click', () => {
        const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: 'customer@email.com',
            plan: 'PLN_0hsdfs3dd35nau4',
            callback: function(response) {
                window.location.href = 'dashboard.html'
            },
            onClose: function() {
                alert('Payment cancelled')
            }
        })
        handler.openIframe()
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

// UPLOAD
if (window.location.href.includes('upload')) {
    const submitBtn = document.getElementById('submit-release')
    
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                window.location.href = 'login.html'
                return
            }

            const title = document.getElementById('release-title').value
            const artistName = document.getElementById('artist-name').value
            const releaseType = document.getElementById('release-type').value
            const genre = document.getElementById('genre').value
            const releaseDate = document.getElementById('release-date').value

            if (!title || !artistName || !releaseDate) {
                alert('Please fill in Release Title, Artist Name and Release Date')
                return
            }

            submitBtn.textContent = 'Submitting...'
            submitBtn.disabled = true

            const { error } = await supabase
                .from('releases')
                .insert({
                    user_id: user.id,
                    title: title,
                    artist_name: artistName,
                    release_type: releaseType,
                    genre: genre,
                    release_date: releaseDate,
                    status: 'pending',
                    streams: 0
                })

            if (error) {
                alert('Error submitting release: ' + error.message)
                submitBtn.textContent = 'Submit for Distribution'
                submitBtn.disabled = false
            } else {
                alert('🎉 Release submitted successfully!')
                window.location.href = 'dashboard.html'
            }
        })
    }
}