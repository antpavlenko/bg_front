mainApp.config(function($routeProvider, $locationProvider) {
    $routeProvider        
        .when("/fcts", {
            templateUrl : '/js/views/facts.html',
            controller  : 'FactsController'
        })        
        .when("/fct/new", {
            templateUrl : '/js/views/fact_item.html',
            controller  : 'FactItemController'
        })
        .when("/fct/:id/:action", {
            templateUrl : '/js/views/fact_item.html',
            controller  : 'FactItemController'
        });
    });


mainApp.controller('FactsController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "fct";

    $scope.refresh = function(){
        $scope.facts = APIResources.facts.query();
        $scope.dimensions = APIResources.dimensions.query();
    };
    
    $scope.deleteItem = function(item){
        APIResources.facts.delete({"id" : item._id}, item).then(
            function(){
                $scope.refresh();
            }
        );
        
    };

    $scope.refresh();
});


mainApp.controller('FactItemController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "fct";

    $scope._action = $routeParams.action;

    $scope.refresh = function(){
        if($routeParams["id"]!==undefined){
            $scope.item = APIResources.facts.get({"id" : $routeParams["id"]});
            if($routeParams.action=='view'){
                $scope.dimensions = APIResources.dimensions.query();
            }
        }else{
            $scope.item = {};
        }

        $scope.dimensions = APIResources.dimensions.query();        
    };

    $scope.save = function(item){
        var id = item._id;

        item = ModelService.cleanItem(item);

        if($routeParams.id!==undefined){
            APIResources.facts.update({"id" : id}, item);
        }else{
            APIResources.facts.save({}, item);
        }
        
        $scope.refresh();
        $location.path("/fcts/" + id + "/view");
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

    $scope.clearRole = function(dim){
        dim.roleNameRU = undefined;
        dim.roleNameEN = undefined;
    };

    $scope.refresh();
});