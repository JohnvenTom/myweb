/**
 * 为作品集页面添加交互效果
 * 主要功能：
 * 1. 监听滚动事件实现平滑滚动
 * 2. 添加页面加载动画
 */

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    // 平滑滚动到作品集部分
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if(scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.querySelector('.portfolio-container').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // 延迟加载动画
    setTimeout(() => {
        document.querySelectorAll('.portfolio-item').forEach((item, index) => {
            item.style.animation = `fadeInUp 0.5s ease-out ${index * 0.2}s forwards`;
            item.style.opacity = '0';
        });
    }, 500);
});

// 添加新的动画定义
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// 音乐播放器功能
// 歌曲列表
// 歌曲列表
const songs = [
    './music/Air on the G String (Suite No. 3.mp3',
    './music/I Was Never There - Th.mp3',
    './music/Light dance-sakanaction.mp3',
    './music/Merry Christmas Mr.La.mp3',
    './music/sakanaction.mp3',
    './music/sakanaction（サカナクション) .mp3',
    './music/sakanaction（サカナクション).mp3'
];

// 默认音频文件路径
const defaultAudioPath = songs[0];

// 初始化歌曲列表
(function initSongList() {
    // 使用硬编码的歌曲列表
    if(songs.length === 0 && defaultAudioPath) {
        songs.push(defaultAudioPath);
    }
})();
let currentSongIndex = 0;

const audioPlayer = new Audio();

// 检查音频文件是否存在
/**
 * 检查音频文件是否存在
 * 功能：通过创建音频元素并监听其事件来检查文件是否存在，避免CORS限制
 * 参数：url - 要检查的音频文件路径
 * 返回值：Promise<boolean> - 文件是否存在
 * 注意事项：使用Audio元素代替XHR解决CORS问题
 */
function checkAudioFile(url) {
    return new Promise((resolve) => {
        const audio = new Audio();
        audio.src = url;
        
        audio.addEventListener('canplaythrough', () => {
            resolve(true);
        }, { once: true });
        
        audio.addEventListener('error', () => {
            resolve(false);
        }, { once: true });
    });
}

// 初始化音频播放器
/**
 * 初始化音频播放器
 * 功能：加载音频文件并设置播放器源，解决CORS限制问题
 * 异常：当音频文件加载失败时抛出错误
 * 注意事项：使用相对路径直接设置src属性，避免fetch导致的CORS问题
 */

async function initAudioPlayer() {
    try {
        // 检查音乐文件是否存在
        const fileExists = await checkAudioFile(songs[currentSongIndex]);
        if (!fileExists) {
            const defaultExists = await checkAudioFile(defaultAudioPath);
            if (!defaultExists) {
                throw new Error('没有可用的音频文件');
            }
            audioPlayer.src = defaultAudioPath;
        } else {
            audioPlayer.src = songs[currentSongIndex];
        }
        
        // 监听错误事件
        audioPlayer.addEventListener('error', () => {
            console.warn('音频加载失败');
        }, { once: true });
    } catch (error) {
        console.error('音频初始化失败:', error);
    }
}

// 初始化音频播放器
const playBtn = document.querySelector('.play-btn');
playBtn.addEventListener('click', async function initOnFirstPlay() {
    try {
        await initAudioPlayer();
        playBtn.removeEventListener('click', initOnFirstPlay);
        
        // 立即更新按钮状态
        playBtn.classList.add('playing');
        playBtn.classList.remove('paused');
        
        // 更新歌曲信息
        updateSongInfo(songs[currentSongIndex]);
        
        // 仅在用户交互后播放
        if(!isPlaying) {
            audioPlayer.play();
            isPlaying = true;
        }
    } catch (error) {
        console.error('播放失败:', error);
        playBtn.textContent = '无可用音乐';
        playBtn.disabled = true;
    }
}, { once: true });

const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const progressBar = document.querySelector('.progress-bar');

let isPlaying = false;
let isDragging = false;

// 播放/暂停控制
playBtn.addEventListener('click', () => {
    if(isPlaying) {
        // 添加淡出效果
        const fadeDuration = 500; // 淡出持续时间(毫秒)
        const startVolume = audioPlayer.volume;
        const fadeStep = startVolume / (fadeDuration / 50);
        
        const fadeInterval = setInterval(() => {
            if(audioPlayer.volume > 0.1) {
                audioPlayer.volume -= fadeStep;
            } else {
                clearInterval(fadeInterval);
                audioPlayer.pause();
                audioPlayer.volume = startVolume; // 恢复原始音量
                playBtn.classList.add('paused');
                playBtn.classList.remove('playing');
                isPlaying = false;
            }
        }, 50);
    } else {
        audioPlayer.volume = 1.0;
        audioPlayer.play();
        playBtn.classList.add('playing');
        playBtn.classList.remove('paused');
        isPlaying = true;
    }
});

// 上一首
prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    changeSong(currentSongIndex);
});

// 下一首
nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    changeSong(currentSongIndex);
});

// 切换歌曲
function changeSong(index) {
    audioPlayer.pause();
    audioPlayer.src = songs[index];
    
    // 更新歌曲信息显示
    updateSongInfo(songs[index]);
    
    if(isPlaying) {
        audioPlayer.play();
    }
}

// 歌曲播放结束自动切歌
audioPlayer.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    changeSong(currentSongIndex);
});

/**
 * 更新歌曲信息显示
 * 功能：从文件名中提取歌曲名称和艺术家信息并更新显示
 * 参数：filePath - 音频文件路径
 * 注意事项：假设文件名格式为"歌曲名 - 艺术家名.mp3"
 */
function updateSongInfo(filePath) {
    const fileName = filePath.split('/').pop().replace('.mp3', '');
    const [title, artist] = fileName.split(' - ');
    
    const titleElement = document.querySelector('.song-title');
    const artistElement = document.querySelector('.song-artist');
    
    if(titleElement) titleElement.textContent = title || '未知歌曲';
    if(artistElement) artistElement.textContent = artist || '未知艺术家';
}

// 更新进度条
audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress}%`;
});

// 进度条交互
const progressContainer = document.querySelector('.progress-container');

// 点击跳转
progressContainer.addEventListener('click', (e) => {
    if(!isDragging) {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        
        audioPlayer.currentTime = (clickX / width) * duration;
    }
});

// 拖动开始
progressContainer.addEventListener('mousedown', () => {
    isDragging = true;
});

// 拖动结束
window.addEventListener('mouseup', () => {
    if(isDragging) {
        isDragging = false;
    }
});

// 拖动中
progressContainer.addEventListener('mousemove', (e) => {
    if(isDragging) {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        
        audioPlayer.currentTime = (clickX / width) * duration;
    }
});
