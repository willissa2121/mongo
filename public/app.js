$.getJSON('/all', data => {
  for (var i = 0; i < data.length; i++) {
    console.log(data[i])
    string = data[i].title.split('/');
    let newStr = string[7].replace(/-/g, " ")
    let stringy = string[3] + "/" + string[4] + '/' + string[5] + " " + newStr

    let li = $("<li>")
    li.text(stringy)
    // console.log(stringy)
    $("#append-here").append(li);
    $("#append-here").append(data[i].description)

  }
})