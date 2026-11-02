/*
 * 作者: 吴欢
 * 建立时间: 2026-11-02 13:39
 * 使用模型: Kimi-K3
 * 功能名称及简介: whTabs 可复用选项卡组件 - 为页面中的 tab 选项卡绑定事件监听，
 *                 点击时先清除所有选项卡与面板的选中状态，再设置当前元素的选中状态。
 */

/**
 * 功能: wh_initTabs
 * 简介: 初始化一组选项卡。通过容器选择器定位 tab 组件，为其内部所有
 *       .wh_tab_btn 按钮注册 click 事件监听；点击时清除全部按钮与面板的
 *       wh_active 选中状态，再为当前按钮及其对应面板添加 wh_active。
 *       可重复调用以支持页面中多组选项卡，实现复用。
 * 作者: 吴欢
 * 建立时间: 2026-11-02 13:39
 * 使用模型: Kimi-K3
 */
//dom的查找方式：querySelectorAll()
//参数：选择器字符串
//返回值：NodeList对象，包含所有匹配的元素
//注意：NodeList对象是类数组对象，不能直接使用数组方法，需要转换为数组
//转换为数组的方法：Array.from()
//参数：NodeList对象
//返回值：数组对象，包含所有匹配的元素
//注意：Array.from()方法返回的是一个新的数组对象，不会改变原NodeList对象
function wh_initTabs(wh_containerSelector) {
    // 查找页面中所有匹配的选项卡容器，支持多组复用
    var wh_containers = document.querySelectorAll(wh_containerSelector);

    wh_containers.forEach(function (wh_container) {
        var wh_buttons = wh_container.querySelectorAll(".wh_tab_btn");
        var wh_panels = wh_container.querySelectorAll(".wh_tab_panel");

        // 为每个按钮注册事件监听
        wh_buttons.forEach(function (wh_btn) {
            wh_btn.addEventListener("click", function () {
                // 1. 清除所有选项卡按钮的选中状态
                wh_buttons.forEach(function (wh_b) {
                    wh_b.classList.remove("wh_active");
                });
                // 2. 清除所有面板的选中状态
                wh_panels.forEach(function (wh_p) {
                    wh_p.classList.remove("wh_active");
                });

                // 3. 设置当前元素的选中状态
                wh_btn.classList.add("wh_active");
                var wh_target = wh_btn.getAttribute("data-wh-target");
                var wh_panel = wh_container.querySelector("#" + wh_target);
                if (wh_panel) {
                    wh_panel.classList.add("wh_active");
                }
            });
        });
    });
}

// 页面加载完成后自动初始化所有 .wh_tabs 选项卡组件
document.addEventListener("DOMContentLoaded", function () {
    wh_initTabs(".wh_tabs");
});
