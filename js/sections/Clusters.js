mainApp.config(function($routeProvider, $locationProvider) {
    $routeProvider        
        .when("/clss", {
            templateUrl : '/js/views/clusters.html',
            controller  : 'ClustersController'
        })        
        .when("/cls/new", {
            templateUrl : '/js/views/cluster_item.html',
            controller  : 'ClusterItemController'
        })
        .when("/cls/:id/:action", {
            templateUrl : '/js/views/cluster_item.html',
            controller  : 'ClusterItemController'
        });
    });


mainApp.controller('ClustersController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "cls";

    $scope.refresh = function(){

        $scope.clusters = APIResources.clusters.query();

    };
    
    $scope.deleteItem = function(item){
        APIResources.clusters.delete({"id" : item._id}, item);
        $scope.refresh();
    };

    $scope.refresh();
});


mainApp.controller('ClusterItemController', function($scope, $route, $routeParams, $location, $rootScope, APIResources, ModelService) {
    $rootScope.module = "cls";

    $scope._action = $routeParams.action;

    $scope.refresh = function(){
        if($routeParams["id"]!==undefined){
            $scope.item = APIResources.clusters.get({"id" : $routeParams["id"]});
        }else{
            $scope.item = {};
        }        
    };

    $scope.save = function(item){
        var id = item._id;

        item = ModelService.cleanItem(item);

        if($routeParams.id!==undefined){
            APIResources.clusters.update({"id" : id}, item);
        }else{
            APIResources.clusters.save({}, item);
        }
        
        $scope.refresh();
        $location.path("/clss");
    };

    $scope.refresh();
});