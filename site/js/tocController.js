app.controller('TocController' , function ($scope , findlayFactory, tocFactory , naturalFactory){

	function init(){
		var state = new tocFactory.State();		
		$scope.getToc = tocFactory.getToc; //Fetch the TOC
		$scope.getInd = naturalFactory.getInd; //Get an individual section
		$scope.findchapter = tocFactory.findchapter; //Function to find a chapter
		$scope.show = tocFactory.show; //Show the chapter
		$scope.increment = tocFactory.increment; //Increment section
		$scope.decrement = tocFactory.decrement; //Decrement section
		$scope.getit = tocFactory.getit;
		$scope.find_section = tocFactory.find_section;
		$scope.getIndFindlay = findlayFactory.getIndFindlay;
		$scope.sectionIndex;
		$scope.getInd(1)
		.then(function(data){
			console.log(data);
			$scope.sectiontext = data.data;
		});
		$scope.getIndFindlay(1).then(function(data){
			$scope.findlaytext = data.data;
		})

		//In the process of refactoring this out where object is created (scraper.js)
		//This should actually be a method on each chapter
		$scope.find_chapter_boundaries = function find_chapter_boundaries( title ){
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
		$scope.changechapter = function( the_state , delta ){
			the_state.chapter = $scope.findchapter($scope.toc.data , the_state.cursor + delta);
			the_state.bounds = $scope.find_chapter_boundaries(the_state.chapter);
			$('section.part').hide();
			$scope.show(the_state , the_state.chapter)

			
		}

		$scope.loadControls = function(){  //Load in UI
			$(document).bind('keydown', function (event) { 

				var sections  = $('li.section');
				if(event.which == 84){
					$('#text').toggleClass('full');
					$('#back').toggle()
					$('#findlaytext').toggleClass('full');
				}

				//BS text navigation
				if(event.which == 50){
					var cur;
					cur  = $('span.word.current-word').first();
					var next = cur.next();
					var last_word = $('span.word.current-word').parent().find('span.word').last();
					console.log(last_word.text());
					var next_p = $('span.word.current-word').parent().next().find('span.word').first();
					console.log(next_p.text());
					if ( cur.is(last_word)){
						$('span.word.current-word').removeClass('current-word');
						next_p.addClass('current-word');
					} else {
						$('span.word.current-word').removeClass('current-word');
						next.addClass('current-word');
						  $('#sectiontext').scrollTo(next);
					}
				}
				if(event.which == 49){
				var cur  = $('span.word.current-word').first();
				
				var first_word = $('#sectiontext > li').first().find('span.word').first();

					var prev = cur.prev();
					if(first_word.is(prev)){
						console.log("it is!")
					} else {
						$('span.word.current-word').removeClass('current-word');
						prev.addClass('current-word');
						$('#sectiontext').scrollTo(prev);	
					}

				}

				if(event.which == 39){
					var cur  = $('li.section.focus');
					
					$scope.increment(state , $scope)
					$scope.find_section(state.cursor , sections);

					var prev_heading = cur.parent().prev()
					$('#back').scrollTo(prev_heading);	
				}

				
				if(event.which == 13){
					console.log("fired enter");
					console.log("cursor at" + state.cursor);
					$scope.getInd(state.cursor)
					.then(function(data){
						console.log(data);
						$scope.sectiontext = data.data;
					});
					$scope.getIndFindlay(state.cursor)
					.then(function(data){
						$scope.findlaytext = data.data;
						$('#sectiontext > li').find('span.word').first().next().addClass('current-word')
					})
					
				}
				if(event.which == 86){
					$('#findlaytext').toggle();
					$('#text').toggleClass('half');
					$('#sectiontext').toggleClass('half');
				}

				if(event.which == 37){
					var cur  = $('li.section.focus');
					console.log(cur.text());
					function find_section(count){
						console.log("count is : " + count)
						sections.each(function(index){
							$(this).removeClass('focus');

							if( $(this).text().trim() == count){
								console.log($(this).text());
								$(this).addClass('focus');
							}
						})
					}
					$scope.decrement(state , $scope)
					$scope.find_section(state.cursor , sections);

					var prev_heading = cur.parent().prev()
					$('#back').scrollTo(prev_heading);	
				}
			})
	}

$scope.getToc().then(function(data){
	$scope.toc = data;
	return data;
}).then(function(data){
	setTimeout(function(){
		$('li.section').first().addClass('focus');
		$scope.show(state , state.chapter)
		$scope.loadControls();
		$scope.changechapter(state ,  0);
	}
	, 0);
})
	}
	init();
})
