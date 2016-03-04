define(['./model'], function (model) {
    model.controller = function(args) {
        return new model.vm.init();
    };
});
