//Write a function which sees if all the (808) sections
// are contained within the toc
// Array.prototype.clean = function(deleteValue) {
//   for (var i = 0; i < this.length; i++) {
//     if (this[i] == deleteValue) {         
//       this.splice(i, 1);
//       i--;
//     }
//   }
//   return this;
// };
// bigAarr = bigAarr.clean(undefined);
// function match_subtitles(all , entries){
//     var newentries = [];
//     all.forEach(function(item){
//         var current = item[0]
//         entries.forEach(function(entry){
//             if(entry.title == current){
//                 entry.subtitles =[];
//                 item.forEach(function(ind , index){
//                     if(index == 0){
//                     }else{
//                     entry.subtitles.push(ind);                        
//                     }
//                 })
//             }
//             newentries.push(entry)
//         })
//     })
//  res.send(newentries);   
// }

//First flatten out the array
var newtoc = [];
toc.forEach(function(entry){
    entry.forEach(function(single){
        newtoc.push(single);
    })
})
//Lets see if the TOC has the right length (808)
//console.log(newtoc.length);
//Unfortunately it has a length of 797
//So lets see which ones are missing

//First lets remove the trailing periods of whichever sections have them
newtoc.forEach(function(el , index){
    var reg  = /\./;
    if (reg.test(el)){
        //It looks like sections 1-89 have the trailing periods
        //Chop em off
        newtoc[index] = el.substring(0 , el.length-1);
    }
})
//Our newtoc should be only numbers now
//Lets make a function which sees if they are in order

//All of the elements need to be converted into numbers
newtoc.forEach(function (element, index){
    if(typeof(newtoc[index])  == 'string'){
        newtoc[index] = Number(element);
    }
})
//Then we write a function which checks whether a number is
//in the TOC list
function check(array , num){
    var found = 0;
    for(var item in newtoc){
        if(newtoc[item] == Number(num)){
            found = 1;
        }
    }
    if (found == 0){
        //console.log(num)
    }

}
//Check whether all 808 sections of the phenomenology
//Are in the TOC
for(var i = 0 ; i <= 808; i++){
    check(newtoc , i );
}
//Console logs that sections 527-537 are not there
//Investigate: It looks like the contents from this page arent there
//https://www.marxists.org/reference/archive/hegel/works/ph/phc2b1b.htm

//Turns out there was a problem with the cheerio functions used to 
//call the p's and a's -- all good now

//Next:
//1. Add the chapter titles and the sections under a heading.
//2. Process the data on each individual page to find the subheadings.
//3. New mongo schema
  // res.send(toc);