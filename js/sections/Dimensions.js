mainApp.config(function($routeProvider, $locationProvider) {
    $routeProvider        
        .when("/dims/", {
            templateUrl : '/js/views/dimensions.html',
            controller  : 'DimensionsController'
        })
        .when("/dim/new", {
            templateUrl : '/js/views/dimension_item.html',
            controller  : 'DimensionItemController'
        })
        .when("/dim/:id", {
            templateUrl : '/js/views/dimension_item.html',
            controller  : 'DimensionItemController'
        });
    });

mainApp.controller('DimensionsController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "dim";

    $scope.refresh = function(){

        $scope.dimensions = APIResources.dimensions.query();
        $scope.clusters = APIResources.clusters.query();

    };
    
    $scope.deleteItem = function(item){
        APIResources.dimensions.delete({"id" : item._id}, item);
        $scope.refresh();
    };

    $scope.refresh();
});

mainApp.controller('DimensionItemController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "dim";
    
    $scope.refresh = function(){
        if($routeParams["id"]!==undefined){
            $scope.item = APIResources.dimensions.get({"id" : $routeParams["id"]});
        }else{
            $scope.item = {};
        }
        
        $scope.clusters = APIResources.clusters.query();
    };

    $scope.save = function(item){
        var id = item._id;
        item = ModelService.cleanItem(item);

        if($routeParams.id!==undefined){
            APIResources.dimensions.update({"id" : id}, item);
        }else{
            APIResources.dimensions.save({}, item);
        }
        
        $scope.refresh();
        $location.path("/dims");
    };

    $scope.addSubItem = function(item, subItemsName){
        if(item[subItemsName]===undefined){
            item[subItemsName] = [];
        }

        item[subItemsName].unshift({});
    };

    $scope.clear = function(i, arr){
        ModelService.clear(i, arr);
    };

    $scope.refresh();
});
