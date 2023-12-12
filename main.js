// 1. Render song
// 2. Cd sroll Top
// 3. Play & Pause
// 4. CD Rotage
// 5. Next & previous
// 6. Random
// 7. Next khi end Song
// 8. Active Song
// 9. Scroll Song to view
// 10. Play song when click
// 11. config setting

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "PLAYER"

const player = $('.player')
const playList = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playLoading = $('#progress'); 
const nextBtn = $('.btn-next');
const previousBtn = $('.btn-prev');
const playBtn = $('.btn-toggle-play')
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs : [
        {
            name: 'Thuyền Quyên',
            singer: 'Diệu Kiên',
            path: 'assets/Audio/thuyen_quyen_dieu_kien.mp3',
            image: 'assets/image/Thuyền Quyên.jpg',
        }, 
        {
            name: 'Ngày mai người ta lấy chồng',
            singer: 'Hoài Lâm',
            path: 'assets/Audio/ngay_mai_nguoi_ta_lay_chong_thanh_dat_hoai_lam.mp3',
            image: 'assets/image/Ngày mai người ta lấy chồng.jpg',
        }, 
        {
            name: 'Hết thương cạn nhớ',
            singer: 'Đức Phúc',
            path: 'assets/Audio/het_thuong_can_nho_duc_phuc.mp3',
            image: 'assets/image/Hết thương cạn nhớ.jpg',
        }, 
        { 
            name: 'Nợ nhau một lời (Lofi ver.)',
            singer: 'Phúc Chinh - Bụi Chill',
            path: 'assets/Audio/no_nhau_mot_loi_lofi_ver_phuc_chinh.mp3',
            image: 'assets/image/Nợ nhau một lời.jpg',
        }, 
        {
            name: 'Hôm qua tôi đã khóc',
            singer: 'Remix TikTok',
            path: 'assets/Audio/hom_qua_toi_da_khoc_remix.mp3',
            image: 'assets/image/Hôm qua tôi đã khóc.jpg',
        },         
        {
            name: 'Making My Way',
            singer: 'Sơn Tùng MTP',
            path: 'assets/Audio/making_my_way_son_tung_m_tp.mp3',
            image: 'assets/image/Making My Way.jpg',
        },         
    ],
    
    render: function() {
        var htmls = this.songs.map((song, index) => {
            return `
                    <div class="song ${index === this.currentIndex ? 'active':''}" data-index = "${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h2 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div> 
                `
        })
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth 
        // animation JS CD rotate
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,    
            iterations: Infinity   
        })
        cdThumbAnimate.pause()
        // xử lí scroll CD khi kéo bài hát lên
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop //trừ đi scrollTop
                cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0  // check đảm bảo về ẩn hết CD
                cd.style.opacity = newCdWidth / cdWidth;
        } 
        // xử lí play & pause button
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            } 
        } 
        // xử lí audio
        audio.onplay = function()
            {
                _this.isPlaying = true
                player.classList.add('playing')
                cdThumbAnimate.play()
            }
        audio.onpause = function()
            {
                _this.isPlaying = false
                player.classList.remove('playing')
                cdThumbAnimate.pause()
            }
        // Thanh loading
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progessPercent = Math.floor(audio.currentTime / audio.duration * 100);
                playLoading.value = progessPercent
            }
        }  
        // Tua bài hát
        playLoading.onchange = function(e) {
            const stage = e.target.value * audio.duration / 100
            audio.currentTime = stage
        },

        // next bài hát
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            audio.play() 
            _this.render() 
            _this.scrollToActiveSong()  // chuyển bài và chạy tiếp bài hát
        },
        // previous bài hát
        previousBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong()
            } else {
                _this.previousSong()
            }
            audio.play()  
            _this.render() 
            _this.scrollToActiveSong()
        },
        
        //random bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        // xử lí khi end bài hát và chuyển sang next song
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            }
            else {
                nextBtn.click()
            }
        }
        // repeat song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // Xử lí khi click vào Song
        playList.onclick = function(e) { 
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index) // dateset.index trả và chuổi phải chuyển sang Number
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()

                }
            }
        }
    },
    // load config
    loadConFig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    // load bài hát hiện tại
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    // Next bài hát
    nextSong : function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    previousSong : function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    // random song
    randomSong: function() {
        let tempRandom
        do {
            tempRandom = Math.floor(Math.random() * this.songs.length)
        }
        while (tempRandom === this.currentIndex)
        this.currentIndex = tempRandom
        this.loadCurrentSong()
    },
    // Scroll to Active song
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 200)
    },
    start: function() {   
        this.loadConFig()   // gán cấu hình config vào 
        this.defineProperties();   // định nghĩa các thuộc tính cho object   
        this.handleEvents(); // chức năng xử lí thanh cuộn onscroll
        this.loadCurrentSong(); //Tải thông tin bài hát vào UI khi chạy ứng dụng
        this.render();  // chức năng render ra danh sách bài hát

        // hiện thị trạng thái ban đầu của button repeat và random
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
    }
}
app.start()
