/* Hover Quote Extension - script.js (v1.1.1 - Polling Guard Version) */

(function() {
    // 哨兵函数：持续检查SillyTavern核心是否准备就绪
    function waitForSillyTavern() {
        // 检查核心变量和DOM元素是否存在
        if (typeof window.characters !== 'undefined' && 
            typeof window.currently_selected_character !== 'undefined' && 
            document.getElementById('chat') &&
            document.querySelector('.mes')) { // 增加检查，确保至少有一个消息框已渲染
            
            console.log("HoverQuote: SillyTavern core is ready. Initializing main logic.");
            mainLogic();
        } else {
            // 如果还没准备好，100毫秒后再检查一次
            console.log("HoverQuote: Waiting for SillyTavern core...");
            setTimeout(waitForSillyTavern, 100);
        }
    }

    // 页面加载完成后，启动哨兵
    document.addEventListener('DOMContentLoaded', waitForSillyTavern);

    function mainLogic() {
        try {
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
                    return [ "Error fetching quotes." ];
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

            // 初始化时为已存在的消息添加气泡
            document.querySelectorAll('#chat .mes:not(:last-child)').forEach(createHoverElement);

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
            
            document.body.addEventListener('char_changed', () => { quoteCache = {}; });

            console.log("💬 Hover Quote extension (v1.1.1) initialized successfully!");

        } catch (error) {
            console.error("HoverQuote critical error in mainLogic:", error);
        }
    }
})();
