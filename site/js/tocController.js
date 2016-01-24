app.controller('TocController' , function ($scope , tocFactory){
	function init(){
		$scope.getToc = tocFactory.getToc;
		$scope.levelone = [];

		$scope.getToc().then(function(data){
			$scope.toc = data;
			return data;
		}) 
		.then(function(data){
			data.data.forEach(function(el){
				if ( el.level == 1){
					$scope.levelone.push(el)
				}
			})
		})



		$('.levelone')
	}
	init();
})
