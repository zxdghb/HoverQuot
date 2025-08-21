/* Hover Quote Extension - script.js (v1.1.0 - Final Safe Version) */

(function() {
    // 确保在SillyTavern完全加载后再执行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initHoverQuote();
    } else {
        document.addEventListener('DOMContentLoaded', initHoverQuote);
    }

    function initHoverQuote() {
        // 使用 try...catch 来捕获任何可能的初始化错误
        try {
            // 延迟执行，等待SillyTavern的核心变量完全准备好
            setTimeout(() => {
                if (typeof characters === 'undefined' || typeof currently_selected_character === 'undefined' || !document.getElementById('chat')) {
                    console.error("HoverQuote Error: SillyTavern core is not ready. Aborting.");
                    return;
                }
                mainLogic();
            }, 1000); // 延迟1秒，确保万无一失
        } catch (error) {
            console.error("HoverQuote critical error during init:", error);
        }
    }

    function mainLogic() {
        let quoteCache = {};
        const chatElement = document.getElementById('chat');

        function extractSentences(text) {
            if (!text || typeof text !== 'string') return [];
            const sentences = text.match(/[^.!?…~]+[.!?…~]+["]?/g) || [];
            return sentences
                .map(s => s.trim().replace(/^"|"$/g, ''))
                .filter(s => s.length > 10 && s.length < 150);
        }

        function getQuotesForCurrentChar() {
            try {
                const charId = window.currently_selected_character;
                if (!charId) return [];
                if (quoteCache[charId]) return quoteCache[charId];
                
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
            } catch (error) {
                console.error("HoverQuote error in getQuotesForCurrentChar:", error);
                return [ "Error fetching quotes." ]; // 返回错误提示
            }
        }

        const getRandomQuote = () => {
            const quotes = getQuotesForCurrentChar();
            if (!quotes || quotes.length === 0) return '"..."';
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
        
        // 监听角色切换事件
        document.body.addEventListener('char_changed', () => { quoteCache = {}; });

        console.log("💬 Hover Quote extension (v1.1.0) loaded successfully!");
    }
})();
