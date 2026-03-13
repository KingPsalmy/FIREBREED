import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// PROTECT DASHBOARD PAGES
const protectedPages = ['dashboard', 'mymusic', 'upload', 'analytics', 'royalties', 'profile']
const isProtectedPage = protectedPages.some(page => window.location.href.includes(page))

if (isProtectedPage) {
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
            window.location.href = 'login.html'
        }
    })
}

// FREE PLAN COUNTER
const loadFreeSpots = async () => {
    const { data } = await supabase
        .from('free_plan_tracker')
        .select('*')
        .single()

    if (data) {
        const spotsRemaining = 10 - data.spots_taken
        const resetDate = new Date(data.reset_date)
        const today = new Date()
        const daysUntilReset = Math.ceil((resetDate - today) / (1000 * 60 * 60 * 24))

        const spotsEl = document.getElementById('spots-remaining')
        const resetEl = document.getElementById('reset-countdown')

        if (spotsEl) {
            if (spotsRemaining <= 0) {
                spotsEl.textContent = 'No spots available'
                const freeBtn = document.getElementById('free-plan')
                if (freeBtn) {
                    freeBtn.textContent = 'Join Waitlist'
                    freeBtn.disabled = true
                    freeBtn.style.opacity = '0.5'
                }
            } else {
                spotsEl.textContent = spotsRemaining
            }
        }

        if (resetEl) {
            resetEl.textContent = daysUntilReset > 0 ? daysUntilReset : 0
        }
    }
}

loadFreeSpots()

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

// LOGOUT
const logoutBtn = document.querySelector('.logout')
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        await supabase.auth.signOut()
        window.location.href = 'index.html'
    })
}

// MY MUSIC PAGE
if (window.location.href.includes('mymusic')) {
    const loadMyMusic = async () => {
        // Show loading spinner
        const musicGrid = document.querySelector('.music-grid')
        if (musicGrid) {
            musicGrid.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            `
        }

        const { data, error } = await supabase
            .from('releases')
            .select('*')

        if (musicGrid) {
            if (!data || data.length === 0) {
                musicGrid.innerHTML = `
                    <div style="color:#888; padding: 40px; text-align:center; grid-column: 1/-1">
                        <p style="font-size:48px">🎵</p>
                        <p style="margin-top:10px">No releases yet.</p>
                        <a href="upload.html" style="color:#ff4500">Upload your first track!</a>
                    </div>
                `
            } else {
                musicGrid.innerHTML = data.map(r => `
                    <div class="music-card">
                        <div class="music-art">🎵</div>
                        <div class="music-info">
                            <p class="music-title">${r.title}</p>
                            <p class="music-meta">${r.release_type} • ${r.release_date}</p>
                            <p class="music-streams">${(r.streams || 0).toLocaleString()} streams</p>
                        </div>
                        <div class="music-status ${r.status === 'live' ? 'live' : 'pending'}">
                            ${r.status === 'live' ? 'Live' : 'Pending'}
                        </div>
                        <div class="music-actions">
                            <button class="action-btn">Edit</button>
                            <button class="action-btn danger">Remove</button>
                        </div>
                    </div>
                `).join('')
            }
        }
    }

    loadMyMusic()
}

// PROFILE PAGE
if (window.location.href.includes('profile')) {
    const loadProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { window.location.href = 'login.html'; return }
        
        const user = session.user

        // Load existing profile
        const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)

const profile = profiles && profiles[0]

        // Fill in form fields if profile exists
        if (profile) {
            const fields = {
                'artist-name': profile.artist_name,
                'real-name': profile.full_name,
                'email': profile.email,
            }
            Object.entries(fields).forEach(([id, value]) => {
                const el = document.getElementById(id)
                if (el && value) el.value = value
            })
        }

        // Save profile
        const saveBtn = document.querySelector('.submit-btn')
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const artistName = document.getElementById('artist-name')?.value
                const fullName = document.getElementById('real-name')?.value
                const email = document.getElementById('email')?.value

                saveBtn.textContent = 'Saving...'
                saveBtn.disabled = true

                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        artist_name: artistName,
                        full_name: fullName,
                        email: email,
                    })

                if (error) {
                    alert('Error saving profile: ' + error.message)
                } else {
                    alert('✅ Profile saved successfully!')
                }

                saveBtn.textContent = 'Save Changes'
                saveBtn.disabled = false
            })
        }
    }

    loadProfile()
}