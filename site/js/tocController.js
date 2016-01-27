app.controller('TocController' , function ($scope , tocFactory , naturalFactory){

	function init(){

		var firstchapter = 'PREFACE\nOn scientific knowledge';		
		$scope.getToc = tocFactory.getToc;
		$scope.getInd = naturalFactory.getInd;
		var state = {};
		state.cursor = 1;
		state.chapter = firstchapter;

		$scope.changechapter = function( the_state , delta){
			state.chapter = $scope.findchapter($scope.toc.data , the_state.cursor + delta);
			state.bounds = $scope.find_chapter_boundaries(state.chapter);
			$('section.chapter').hide();
			$scope.show(the_state , state.chapter)

		}
		$scope.show = function(the_state , title ){
			console.log("looking for : " + title)
			var chap_title = $('span.chapter.title');
			chap_title.each(function(){
				if($(this).text() == title){
					$(this).parent().parent().show(500);
				}
			})
		}
		$scope.findchapter = function (toc , number){
			var result;
			console.log("finding : " + number)
			toc.forEach(function(chapter){				

				if(chapter.subsections.length >  0 ){  //if it has subsections
					console.log('has subsections ... ')

					chapter.subsections.forEach(function(subsection){ 
						console.log(subsection)
						if(subsection == number){ 
							result = chapter.title;
						}
					})
				}
				if(chapter.subchapters.length > 0){ //if it has subchapters
					console.log('has subchapters... ')
					chapter.subchapters.forEach(function(subsub){
						console.log(subsub.title);
						subsub.subsections.forEach(function(subsects){
							console.log(subsects);
							if(subsects == number){
								result = chapter.title;
							}
						})
					})
				}

		})
		return result;
	}
		$scope.increment = function( the_state ){
			if (the_state.cursor + 1 > the_state.bounds.upper){
					console.log('changed section');
					//go to the next section
					//first find next chapter
					$scope.changechapter(the_state , 1 );
					state.cursor = state.cursor + 1;
					
			} else {
				state.cursor = state.cursor + 1; 
			}
		}

		$scope.decrement = function( the_state ){

			if (the_state.cursor - 1 < the_state.bounds.lower){
				if(the_state.cursor - 1 <= 0 ){
				
			}else{
					console.log('changed section');
					//go to the next section
					//first find next chapter
					$scope.changechapter(the_state , -1 );
					state.cursor = state.cursor-1;
				}
			} else {
				state.cursor = state.cursor - 1; 
			}
		}

		$scope.getit = function(num){
        	
        	$scope.getInd(num).success(function(data){
            	return data;
        	})
	        
	        .then(function(data){
    	        $scope.ind = data.data[0];
        	    console.log($scope.ind);
	      	})
    	
    	}


		$scope.loadControls = function(){  //Load in UI
			
			$(document).bind('keydown', function (e) { 
		
				var sections  = $('li.toc');

				if(event.which == 39){
					
					var cur  = $('li.toc.focus');
					console.log(cur.text());
					
					function find_section(count){
						console.log("count is : " + count)
						sections.each(function(index){
							$(this).removeClass('focus');

							if( $(this).text() == count){
								$(this).addClass('focus');
							}
						})						
					}
					$scope.increment(state)
					find_section(state.cursor);

				}
				if(event.which == 13){
					console.log("fired enter");
					console.log("cursor at" + state.cursor);
						$scope.getInd(state.cursor)
						.then(function(data){
							console.log(data);
							$scope.sectiontext = data.data;
						});
				}

				if(event.which == 37){
					var cur  = $('li.toc.focus');
					console.log(cur.text());
					function find_section(count){
						console.log("count is : " + count)
						sections.each(function(index){
						$(this).removeClass('focus');

							if( $(this).text() == count){
								console.log($(this).text());
								$(this).addClass('focus');
							}
						})
					}
					$scope.decrement(state)
					find_section(state.cursor);
				}
			})
		}

		$scope.getToc().then(function(data){
			$scope.toc = data;
			
			return data;
		}).then(function(data){
			setTimeout(function(){
         $('li.toc').first().addClass('focus');
         	$scope.show(state , firstchapter)
        }
    , 3500);
			$scope.loadControls();
	
	$scope.find_chapter_boundaries = function( title ){
		var boundaries = {}
		var upper;
		var lower;

		$scope.toc.data.forEach(function(chapter){

			if(chapter.title == title){
				console.log("Working on : " + chapter.title);
				
				//Lower
				if(chapter.subsections.length > 0){
					console.log("subsections exist ... ")
					lower = chapter.subsections[0];
					console.log("Found lower : " + lower)
				}
				if (chapter.subsections.length == 0){
					console.log("no subsections");
					lower = chapter.subchapters[0].subsections[0];
					console.log('Found lower : ' + lower)
				}

				//Upper
				if(chapter.subchapters.length == 0){
					console.log("no subchapters")
					upper = chapter.subsections[chapter.subsections.length-1];
					console.log("found upper: " + upper)
				} else {
					console.log("Found subchapters ")
					upper = chapter.subchapters[chapter.subchapters.length-1]
					upper = upper.subsections[upper.subsections.length-1];
					console.log("found upper: " +  upper)
				}
			}
		})
		boundaries.lower = lower;
		boundaries.upper = upper;
		
		return boundaries;
	}
	$scope.changechapter(state ,  0);

	
		})
	}
		init();
	})
