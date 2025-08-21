(function () {
    // 扩展的核心类
    class MemoryBubbleExtension extends TavernExtension {
        constructor() {
            super('memory-bubble');
        }

        // 初始化扩展
        onInit() {
            console.log("聊天气泡回忆扩展已加载。");
            // 监听消息渲染事件，每次有新消息或聊天加载时都会触发
            this.eventSource.on('message-rendered', this.onMessageRendered.bind(this));
            // 聊天加载完成时也触发一次，确保初始加载时有气泡
            this.eventSource.on('chat-loaded', this.onMessageRendered.bind(this));
        }

        // 当消息被渲染到屏幕上时执行
        onMessageRendered() {
            // 为防止重复，先移除所有已存在的气泡
            document.querySelectorAll('.memory-bubble-container').forEach(el => el.remove());

            // 获取聊天区域的所有消息
            const messages = document.querySelectorAll('#chat .mes');

            messages.forEach((msg, index) => {
                // 我们只在角色消息后添加气泡，并且不是最后一条消息
                const isCharacterMessage = !msg.classList.contains('is_user');
                if (isCharacterMessage && index < messages.length - 1) {
                    this.injectBubbleAfter(msg);
                }
            });

            // 为所有新创建的气泡添加事件监听器
            this.addBubbleEventListeners();
        }

        // 在指定消息元素后注入气泡
        injectBubbleAfter(messageElement) {
            const bubbleContainer = document.createElement('div');
            bubbleContainer.className = 'memory-bubble-container';
            bubbleContainer.innerHTML = `
                <div class="memory-bubble">
                    <span class="bubble-text"></span>
                </div>
            `;
            // 将气泡容器插入到消息元素的后面
            messageElement.parentNode.insertBefore(bubbleContainer, messageElement.nextSibling);
        }

        // 为所有气泡添加鼠标事件
        addBubbleEventListeners() {
            const bubbles = document.querySelectorAll('.memory-bubble');
            bubbles.forEach(bubble => {
                bubble.addEventListener('mouseover', this.onBubbleHover.bind(this));
                bubble.addEventListener('mouseout', this.onBubbleMouseOut.bind(this));
            });
        }
        
        // 鼠标悬停事件处理
        onBubbleHover(event) {
            const bubble = event.currentTarget;
            const bubbleTextElement = bubble.querySelector('.bubble-text');

            // 1. 获取所有角色的消息内容
            const characterMessages = Array.from(document.querySelectorAll('#chat .mes:not(.is_user) .mes_text'))
                .map(el => el.textContent.trim())
                .filter(text => text.length > 0);

            if (characterMessages.length === 0) {
                bubbleTextElement.textContent = "（还没有足够的回忆...）";
                return;
            }

            // 2. 将消息内容分割成句子
            const sentences = [];
            characterMessages.forEach(msg => {
                // 使用中英文标点符号分割句子
                const msgSentences = msg.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 5); // 过滤掉太短的片段
                sentences.push(...msgSentences);
            });

            if (sentences.length === 0) {
                bubbleTextElement.textContent = "（回忆都是些片段...）";
                return;
            }

            // 3. 随机选择一个句子
            const randomSentence = sentences[Math.floor(Math.random() * sentences.length)].trim();

            // 4. 显示句子
            bubbleTextElement.textContent = `“${randomSentence}”`;
        }

        // 鼠标移出事件处理
        onBubbleMouseOut(event) {
            const bubble = event.currentTarget;
            const bubbleTextElement = bubble.querySelector('.bubble-text');
            // 清空文字，CSS动画会让它平滑消失
            bubbleTextElement.textContent = '';
        }
    }

    // 注册扩展
    Tavern.registerExtension(new MemoryBubbleExtension());
})();
