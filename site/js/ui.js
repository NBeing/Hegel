 $(document).unbind('keyup').bind('keyup', function (e) {
             var span = $('span');
             
            if(event.which == 70){
                console.log($scope.state);
                if($scope.state == false){
                $('.findlay').toggle();
                console.log('fire');
                $('.ind_section').width('10%');
                
                $scope.state = true; 
                }
                else{
                    console.log('fire true');
                    $('.findlay').toggle();
                       $('.ind_section').width('100%');
                    $scope.state = false;
                }
            }
            if(event.which == 81 ){
                $scope.section = $scope.section - 1;
                $scope.getit($scope.section);
                $scope.getIndFind($scope.finds , $scope.section)
            }
            if(event.which == 69 ){
                $scope.section = $scope.section + 1;
                $scope.getit($scope.section);
                $scope.getIndFind($scope.finds , $scope.section)

            }

            if(event.which == 87){
                $scope.wikis();
            }
                  if(event.which == 65){
                $scope.print();
            }
             if(event.which == 88 ){
                span.each(function(){
                $(this).removeClass('focus');
            })
            }

            if(event.which == 39 ){ //right arrow
                var cur  = $('span.focus');
                span.each(function(){
                $(this).removeClass('focus');
                cur.next().addClass('focus');
            })                
            }

             if(event.which == 37 ){ //right arrow
                var cur  = $('span.focus');
                span.each(function(){
                $(this).removeClass('focus');
                cur.prev().addClass('focus');
            })                
            }
        });


