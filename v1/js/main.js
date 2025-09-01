$(function() {
    $('.sec-it-tab').each(function() {
        var $root = $(this);
        var $tablist = $root.find('.tabs_it_list[role="tablist"]').first();
        var $tabs = $tablist.find('.tab_it_style[role="tab"]');
        var $panels = $root.find('.tabs_it_info[role="tabpanel"]');

        // 保險：有些系統會對 tablist 設 hidden
        $tablist.removeAttr('hidden');

        // 啟用某一個分頁 + 面板
        function activate($tab, opts) {
            if (!$tab || !$tab.length) return;
            var pid = $tab.attr('aria-controls');
            if (!pid) return;

            // 1) roving tabindex + aria-selected（符合 WAI-ARIA Tab 規範）
            $tabs.each(function() {
                var on = (this === $tab[0]);
                $(this).attr({
                    'aria-selected': on ? 'true' : 'false',
                    'tabindex': on ? '0' : '-1'
                });
            });

            // 2) 切換面板：移除其他 active，對目標移除 hidden + 加上 active/mov_on
            $panels.each(function() {
                var $p = $(this);
                var on = ($p.attr('id') === pid);
                if (on) {
                    // 先顯示
                    $p.removeAttr('hidden').addClass('active');
                    // 重新觸發進場動畫：先移除 mov_on -> 強制重排 -> 再加上
                    $p.removeClass('mov_on');
                    void this.offsetWidth; // reflow
                    $p.addClass('mov_on')
                        .one('animationend transitionend', function() { $p.removeClass('mov_on'); });
                } else {
                    $p.attr('hidden', '').removeClass('active mov_on');
                }
            });

            // 3) 焦點管理
            if (!opts || opts.focus !== false) $tab.focus();
        }

        // 初始：若沒有 aria-selected="true"，預設第一顆
        var $init = $tabs.filter('[aria-selected="true"]').first();
        if (!$init.length) $init = $tabs.first().attr({ 'aria-selected': 'true', 'tabindex': '0' });
        activate($init, { focus: false });

        // 滑鼠點擊：切換對應面板
        $tablist.on('click', '.tab_it_style[role="tab"]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $t = $(this);
            if ($t.attr('aria-selected') !== 'true') activate($t);
        });

        // 鍵盤操作：← → ↑ ↓ / Home / End 移動焦點；Enter/Space 啟用
        $tablist.on('keydown', '.tab_it_style[role="tab"]', function(e) {
            var i = $tabs.index(this);
            var len = $tabs.length;
            var next = null;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    next = (i + 1) % len;
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    next = (i - 1 + len) % len;
                    break;
                case 'Home':
                    next = 0;
                    break;
                case 'End':
                    next = len - 1;
                    break;
                case ' ':
                case 'Enter':
                    activate($(this));
                    e.preventDefault();
                    return;
                default:
                    return; // 其他鍵不處理
            }
            e.preventDefault();
            $tabs.eq(next).focus();
        });

        // 防止外部腳本亂動狀態：在下個 tick 再矯正一次
        $tablist.on('click', '.tab_it_style[role="tab"]', function() {
            var $t = $(this);
            setTimeout(function() { activate($t); }, 0);
        });
    });
});



(function() {
    const SEL = '.reveal-bottom-delay1, .reveal-bottom-delay2, .reveal-bottom-delay3';
    const ENTER_RATIO = 0.15;
    const EXIT_RATIO = 0.05;

    // 若使用者偏好減少動畫，直接顯示
    function applyReducedMotion() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll(SEL).forEach(el => el.classList.add('hd-inview'));
            return true;
        }
        return false;
    }

    let io = null;

    function ensureObserver() {
        if (!io) {
            io = new IntersectionObserver((entries) => {
                entries.forEach(({ isIntersecting, intersectionRatio, target }) => {
                    if (isIntersecting && intersectionRatio >= ENTER_RATIO) {
                        target.classList.add('hd-inview');
                    } else if (!isIntersecting || intersectionRatio <= EXIT_RATIO) {
                        target.classList.remove('hd-inview');
                    }
                });
            }, {
                root: null,
                rootMargin: '0px 0px -10% 0px',
                threshold: [0, EXIT_RATIO, ENTER_RATIO, 0.5, 1]
            });
        }
        return io;
    }

    function bind() {
        if (applyReducedMotion()) return;

        const nodes = document.querySelectorAll(SEL);
        if (!nodes.length) return;

        // 無 IO 的瀏覽器（或被 sandbox）-> 直接顯示
        if (!('IntersectionObserver' in window)) {
            nodes.forEach(el => el.classList.add('hd-inview'));
            return;
        }

        const observer = ensureObserver();
        nodes.forEach(el => {
            // 避免重複 observe
            if (!el.hasAttribute('data-io')) {
                el.setAttribute('data-io', '');
                observer.observe(el);
            }
        });
    }

    function init() {
        // DOM ready 後再綁，避免 ODIN 把內容晚點才塞進來
        bind();

        // 若 ODIN/前端框架動態注入內容，補綁新節點
        const mo = new MutationObserver((mutations) => {
            let needRebind = false;
            for (const m of mutations) {
                if (m.addedNodes && m.addedNodes.length) {
                    for (const n of m.addedNodes) {
                        if (n.nodeType === 1) {
                            if (n.matches && n.matches(SEL)) needRebind = true;
                            else if (n.querySelector && n.querySelector(SEL)) needRebind = true;
                        }
                        if (needRebind) break;
                    }
                }
                if (needRebind) break;
            }
            if (needRebind) bind();
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
    // 對 bfcache 返回頁也重新綁
    window.addEventListener('pageshow', () => bind());
})();



$(function() {
    $('.overview_nav').navScroll({
        mobileDropdown: false,
        mobileBreakpoint: 768,
        scrollSpy: true
    });

    $('#overview-nav ul li a').on('click', function() {
        $('#overview-nav ul li').removeClass('on');
        $(this).parent().addClass('on');
    });

});