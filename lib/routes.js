Router.configure({
    loadingTemplate: 'loading',
    layoutTemplate: 'layout'
});
Router.route('/', {
    name: 'home',
    fastRender: true
});
