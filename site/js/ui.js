$(document).ready(function(){
	var span = $('span');
	$('span').each(function(){
		console.log('fired');
		$(this).addClass('blue');
	})
	span.click(function(){
			console.log('fired');
		togglefocus($(this));
	
	})

	$('#text').click(function(){
		print();
	})
function togglefocus(el){
		var focus = el;
		if(focus.hasClass('focus')){
			focus.removeClass('focus')
		}
		else{
			focus.addClass('focus');
		}
	}

function print(){
var focus = $('.focus');

focus.each(function(){
	console.log($(this).text());
})
}	
})
