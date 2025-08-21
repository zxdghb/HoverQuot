/* Hover Quote Extension - script.js (v1.0.1 - Robustness Fix) */
(function() {
    // 使用更可靠的事件监听器来确保SillyTavern完全加载
    document.addEventListener('DOMContentLoaded', initHoverQuote);

    function initHoverQuote() {
        // 确保核心变量已定义
        if (typeof characters === 'undefined' || typeof currently_selected_character === 'undefined') {
            // 如果核心变量还没准备好，稍等一下再试
            setTimeout(initHoverQuote, 200);
            return;
        }

        let quoteCache = {};
        const chatElement = document.getElementById('chat');
        if (!chatElement) {
            console.error("HoverQuote Error: #chat element not found.");
            return;
        }

        function extractSentences(text) {
            if (!text || typeof text !== 'string') return [];
            const sentences = text.match(/[^.!?…~]+[.!?…~]+["]?/g) || [];
            return sentences
                .map(s => s.trim().replace(/^"|"$/g, ''))
                .filter(s => s.length > 10 && s.length < 150);
        }

        function getQuotesForCurrentChar() {
            // 确保 currently_selected_character 是一个有效的 key
            const charId = window.currently_selected_character;
            if (!charId) return [];

            if (quoteCache[charId] && quoteCache[charId].length > 0) {
                return quoteCache[charId];
            }

            const character = window.characters[charId];
            if (!character) return [];

            let quotes = [];
            quotes = quotes.concat(extractSentences(character.description));
            quotes = quotes.concat(extractSentences(character.mes_example));

            if (quotes.length === 0) {
                quotes = [ "...", "嗯？", "我在想一些事情。", "你有什么想说的吗？" ];
            }
            
            quoteCache[charId] = quotes;
            return quotes;
        }

        const getRandomQuote = () => {
            const quotes = getQuotesForCurrentChar();
            if (quotes.length === 0) return '"..."';
            return `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
        };

        function createHoverElement(parent) {
            if (parent.querySelector('.hover-quote-trigger')) return;

            const trigger = document.createElement('div');
            trigger.className = 'hover-quote-trigger';
            trigger.textContent = '💭';

            const card = document.createElement('div');
            card.className = 'hover-quote-card';

            parent.addEventListener('mouseenter', () => {
                card.textContent = getRandomQuote();
                trigger.classList.add('hovered');
                card.classList.add('hovered');
            });

            parent.addEventListener('mouseleave', () => {
                trigger.classList.remove('hovered');
                card.classList.remove('hovered');
            });
            
            parent.appendChild(trigger);
            parent.appendChild(card);
        }

        // 使用 MutationObserver 监听新消息
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

        // ★ 使用原生事件监听器替代jQuery来处理角色切换
        function handleCharChange() {
            quoteCache = {}; // 清空缓存
            console.log("HoverQuote: Character changed, cache cleared.");
        }
        document.body.addEventListener('char_changed', handleCharChange);
        
        console.log("💬 Hover Quote extension (v1.0.1) loaded successfully!");
    }
})();
