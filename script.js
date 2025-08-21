/* Hover Quote Extension - script.js */
(function() {
    // 确保在SillyTavern完全加载后再执行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initHoverQuote();
    } else {
        document.addEventListener('DOMContentLoaded', initHoverQuote);
    }

    function initHoverQuote() {
        let quoteCache = {}; // 缓存每个角色的语录
        const chatElement = document.getElementById('chat');
        if (!chatElement) return;

        // 从文本中提取句子的函数
        function extractSentences(text) {
            if (!text) return [];
            // 使用正则表达式匹配句子，并进行清理
            const sentences = text.match(/[^.!?]+[.!?]+["]?/g) || [];
            return sentences
                .map(s => s.trim().replace(/^"|"$/g, '')) // 去除首尾空格和引号
                .filter(s => s.length > 10 && s.length < 150); // 筛选长度合适的句子
        }

        // 获取当前角色的语录库
        function getQuotesForCurrentChar() {
            const charId = currently_selected_character;
            if (quoteCache[charId]) {
                return quoteCache[charId];
            }

            const character = characters[charId];
            if (!character) return [];

            let quotes = [];
            // 从角色描述中提取
            quotes = quotes.concat(extractSentences(character.description));
            // 从对话示例中提取
            quotes = quotes.concat(extractSentences(character.mes_example));

            // 如果提取不到，提供一些默认的句子
            if (quotes.length === 0) {
                quotes = [
                    "...",
                    "嗯？",
                    "我在想一些事情。",
                    "你有什么想说的吗？"
                ];
            }
            
            quoteCache[charId] = quotes; // 缓存结果
            return quotes;
        }

        // 获取一个随机语录
        const getRandomQuote = () => {
            const quotes = getQuotesForCurrentChar();
            if (quotes.length === 0) return "...";
            return `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
        };

        // 创建卡片和触发器的函数
        function createHoverElement(parent) {
            if (parent.querySelector('.hover-quote-trigger')) return; // 防止重复添加

            const trigger = document.createElement('div');
            trigger.className = 'hover-quote-trigger';
            trigger.textContent = '💭';

            const card = document.createElement('div');
            card.className = 'hover-quote-card';

            // 鼠标悬停事件
            parent.addEventListener('mouseenter', () => {
                card.textContent = getRandomQuote(); // ★ 每次悬停时都获取一句新的随机语录
                trigger.classList.add('hovered');
                card.classList.add('hovered');
            });

            // 鼠标离开事件
            parent.addEventListener('mouseleave', () => {
                trigger.classList.remove('hovered');
                card.classList.remove('hovered');
            });
            
            parent.appendChild(trigger);
            parent.appendChild(card);
        }

        // 监听新消息的生成
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains('mes')) {
                            const prevMessage = node.previousElementSibling;
                            if (prevMessage && prevMessage.classList.contains('mes')) {
                                createHoverElement(prevMessage);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(chatElement, { childList: true });
        
        // 当切换角色时，清空语录缓存
        $(document).on('char_changed', () => {
            quoteCache = {};
        });

        console.log("💬 Hover Quote extension loaded successfully!");
    }
})();