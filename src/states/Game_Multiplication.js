/**
 * @file: Game_Multiplication.js
 * Purpose: Game instance for multiplication game
 * Authors: Jieni Hou, Jason Lee, Jose Rivera
 * Language: ES6
 */
import Phaser from 'phaser'

var currentSet = 0;
var mult_1 = 0;
var mult_2 = 0;
var answer = 0;
var firstOp;
var secondOp;
var answerNum = '5';
var answerOp = [];
var comparison = '';
var numberCorrect = 0;
var stateText = '';
var numberSetToPopulate;

export default class extends Phaser.State {
    init () {
    }

    //Load scene assets to display
    preload () {
        this.load.image('Ice', '../../assets/images/background_ice.jpg')
        this.load.image('Arrow', '../../assets/images/arrow_blue.png')
        this.load.image('menu', '../../assets/images/pause-b.png')
        this.load.image('Pause', '../../assets/images/pause_blue.png')
        this.load.image("IceBlock", "../../assets/images/Snow-Block-100.png")
        this.load.image('IceBlockBroken', '../../assets/images/Snow-Block-num-100.png')
        this.load.image("Monkey", "../../assets/images/user-monkey-big-snow.png")
    }

    create () {
        //----------------------------------------------UI COMPONENT---------------------------------------------
        //Display background in scene
        this.background = this.add.image(0, 0, 'Ice')

        //Adding the monkey onto the background
        this.monkey = this.add.sprite(this.world.centerX * 1.5, 560, 'Monkey')
        this.monkey.scale.setTo(0.5,0.5)

        //Creation of arrow button to exit state and return to game selection
        this.Back_Arrow = this.add.button(this.world.centerX * 0.1, this.world.centerY * 0.1, 'Arrow', actionGoBack, this)
        this.Back_Arrow.anchor.setTo(0.5, 0.5)

        // Game done text
        stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.visible = false;

        //----------------------------------------------ICE BLOCKS COMPONENT---------------------------------------------
        //Need to add a check to see what level was selected
        //Adding the iceblocks onto the game
        this.group  = this.add.group()

        this.group.createMultiple(20,"IceBlock",[0],true)

        this.group.align(5, -1, 150, 150)

        this.group.x = 100
        this.group.y = 200

        //----------------------------------------------LOGIC COMPONENT---------------------------------------------
        //Set the default Arrays for the certain level
        numberSetToPopulate = levelSelect(this.game.global.multiLevel)

        //Because the above array is already randomized, you can pick the first 20 elements to be displayed
        // loop through to fill the children ice blocks with text
        for(var i = 0; i < 20; i++){
            var text = this.add.text(35, 40, numberSetToPopulate[i], {fontSize:"30px", fill: '#000000' });
            text.visible = false
            this.group.children[i].addChild(text)
            this.group.children[i].value = numberSetToPopulate[i]
            this.group.children[i].inputEnabled = true
            this.group.children[i].events.onInputDown.add(listener, this);
            this.group.children[i].events.onInputDown.add(multSet, this);
        }

        //----------------------------------------------DISPLAY COMPONENT---------------------------------------------
        //Display equation onscreen **{Is Updated under update()}**
        firstOp = this.add.text(this.world.centerX * 1.3,this.world.centerY * 0.8, mult_1, {fontSize:"100px", fill:"#000000"});
        var mult_sign = this.add.text(this.world.centerX *1.4,this.world.centerY * 0.8, "X", {fontSize:"80px", fill:"#000000"});
        secondOp = this.add.text(this.world.centerX *1.5,this.world.centerY * 0.8, mult_2, {fontSize:"100px", fill:"#000000"});
        var equals = this.add.text(this.world.centerX * 1.6,this.world.centerY * 0.8, "=", {fontSize:"100px", fill:"#000000"});
        answerOp = this.add.text(this.world.centerX *1.75,this.world.centerY * 0.8, answer, {fontSize:"100px", fill:"#000000"});

        firstOp.anchor.setTo(0.5,0.5)
        mult_sign.anchor.setTo(0.5,0.5)
        secondOp.anchor.setTo(0.5,0.5)
        equals.anchor.setTo(0.5,0.5)
        answerOp.anchor.setTo(0.5,0.5)

        for (var i = 0; i < answerNum.length; i++)
        {
            answerOp[answerNum[i]] = false;
        }

        //  Capture all key presses
        this.input.keyboard.addCallbacks(this, null, null, keyPress);

        // add input from the user
        // testOp.inputEnabled = true
        // testOp.events.onInputDown.add(listener2, this)
        //--------------------------------------------PAUSE MENU COMPONENT------------------------------------------
        var w = this.world.width, h = this.world.height;
        var menu, choiseLabel;
        
        //Create a label to use as a button
        this.pause_label = this.add.image(this.world.centerX * 1.9 , this.world.centerY * 0.1, 'Pause')
        this.pause_label.anchor.setTo(0.5, 0.5)
        this.pause_label.inputEnabled = true;

        this.pause_label.events.onInputUp.add(function () {
            //When the pause button is pressed, we pause the game
            game.paused = true;
            //Then add the menu
            menu = game.add.sprite(w/2, h/2, 'menu');
            menu.anchor.setTo(0.5, 0.5);
            // And a label to illustrate which menu item was chosen. (This is not necessary)
            choiseLabel = game.add.text(w/2, h-150, 'Click outside menu to continue', { font: '30px Arial', fill: '#fff' });
            choiseLabel.anchor.setTo(0.5, 0.5);
        });

        //Add a input listener that can help us return from being paused
        game.input.onDown.add(unpause, self);

        //And finally the method that handels the pause menu
        function unpause(event){
            //Only act if paused
            if(game.paused){
                //Calculate the corners of the menu
                var x1 = w/2 - 270/2, x2 = w/2 + 270/2,
                    y1 = h/2 - 180/2, y2 = h/2 + 180/2;

                //Check if the click was inside the menu
                if(event.x > x1 && event.x < x2 && event.y > y1 && event.y < y2 ){
                    //The choicemap is an array that will help us see which item was clicked
                    var choisemap = ['one', 'two', 'three', 'four', 'five', 'six'];

                    //Get menu local coordinates for the click
                    var x = event.x - x1,
                        y = event.y - y1;

                    //Calculate the choice
                    var choise = Math.floor(x / 90) + 3*Math.floor(y / 90);

                    //Display the choice
                    choiseLabel.text = 'You chose menu item: ' + choisemap[choise];
                }
                else{
                    //Remove the menu and the label
                    menu.destroy();
                    choiseLabel.destroy();

                    //Unpause the game
                    game.paused = false;
                }
            }
        };
    }

    update(){
        if(mult_1==0 && mult_2==0){
            firstOp.visible = false
            secondOp.visible = false
            answerOp.visible = false
        }
        else{
            firstOp.visible = true
            secondOp.visible = true
            answerOp.visible = true
        }
        //Updates product view with newest variables
        firstOp.setText(mult_1)
        secondOp.setText(mult_2)

        answer = mult_1 * mult_2
        answerNum = answer.toString()
        var result = parseInt(comparison)
        // check the number that is entered and make sure that it matches the answer
        if(answer == result){
            console.log("You are a genius. You got the question right!")
            numberCorrect = numberCorrect + 2
            resetGame()
        }
        else{
            //console.log("Idk... try again?")
            if(answerNum.length == comparison.length){
                comparison = ''
            }
            answerOp.setText(" ")
        }

        if(numberCorrect === 20){
            console.log("executing the complete function...")
            this.game.global.multiLevel++
            if(this.game.global.multiLevel == 2){
                this.game.global.unlockMulti2 = true
            }
            else if(this.game.global.multiLevel == 3){
                this.game.global.unlockMulti3 = true
            }
            complete()
        }
        //answerOp.setText(answer)

        //Back arrow scale on hover
        if (this.Back_Arrow.input.pointerOver())
        {
            this.Back_Arrow.scale.setTo(1.1,1.1)
        }
        else
        {
            this.Back_Arrow.scale.setTo(1,1)
        }
        
        //Pause button scale on hover
        if (this.pause_label.input.pointerOver())
        {
            this.pause_label.scale.setTo(1.1,1.1)
        }
        else
        {
            this.pause_label.scale.setTo(1,1)
        }
    } 
}

//Function called on ARROW button to return to 'GameSelect' screen
function actionGoBack () {
    this.state.start('Mult_dif')
    mult_1 = 0
    mult_2 = 0
    answer = 0
    currentSet = 0
}

function resetGame(){
    mult_1 = 0
    mult_2 = 0
    answer = 0
    currentSet = 0
    comparison = ''
}
//Setting variable from current sprite clicked
function multSet(sprite){
    if(mult_1 == 0){
        mult_1 = sprite.value
    }
    else if(mult_2 == 0){
        mult_2 = sprite.value
    }
    else{
        console.log("Stop clicking. Finish your question first")
    }
    console.log("Mult1 = " + mult_1)
    console.log("Mult2 = " + mult_2)
}

//Function to swap iceblock sprite to broken iceblock on click
function listener (sprite) {
    //  AMOUNT OF TIMES THEY CAN CLICK is 2
    if(currentSet < 2){
        //console.log("Current set is less than 2, so the block was broken")
        sprite.loadTexture('IceBlockBroken',0,false)
        var text = this.add.text(sprite.width / 2 - 8, sprite.height / 2 - 20, sprite.value, {fontSize:"30px", fill: '#000000' });
        text.visible = true
        sprite.addChild(text)
        currentSet++
    }
    else{
        console.log("Current set is at max, so the block is not broken")
    }
}

function levelSelect(level){
    var array = []
    var max = 0
    var counter = 1
    // level 1 = 6x6 max
    if(level == 1){
        console.log("level 1 was selected")
        max = 6
        for(var i = 0; i < 20; i++){
            if(counter > max){
                counter = 1
            }
            array[i] = counter
            //console.log("This is the value of the array element: " + i + "This is the value: " + array[i])
            counter++
        }
    }
    // level 2 = 8x8 max
    else if(level == 2){
        console.log("level 2 was selected")
        max = 8
        for(var i = 0; i < 20; i++){
            if(counter > max){
                counter = 1
            }
            array[i] = counter
            //console.log("This is the value of the array2 element: " + i + "This is the value: " + array[i])
            counter++
        }

    }
    // level 3 = 12x12 max
    else{
        console.log("level 3 was selected")
        max = 12
        for(var i = 0; i < 20; i++){
            if(counter > max){
                counter = 1
            }
            array[i] = counter
            //console.log("This is the value of the array3 element: " + i + "This is the value: " + array[i])
            counter++
        }
    }
    return shuffle(array)
}

// shuffle array to give randomness
function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

// checking the number that the user had entered
function keyPress(char) {
    // reset comparison

    //  Loop through each letter of the word being entered and check them against the key that was pressed
    for (var i = 0; i < answerNum.length; i++)
    {
        var letter = answerNum.charAt(i);
        answerOp.setText(char)
        //  If they pressed one of the letters in the word, flag it as correct
        if (char === letter)
        {
            answerOp[letter] = true;
            answerOp.setText(char)
            comparison = comparison + char
        }
    }
    console.log("Result of input is returned here: " + comparison)
}

function complete(){
    mult_1 = 0
    mult_2 = 0
    answer = 0
    currentSet = 0
    comparison = ''
    numberCorrect = 0
    stateText.text = " You Won, \n Click to restart";
    stateText.visible = true;
    // reset the game board again
    console.log("game is complete...")
    game.input.onTap.addOnce(restart,this);
}

// need to modify this to reset the game board!
function restart(){
    console.log("restarting game...")
    stateText.visible = false;

    // for(var i = 0; i < 20; i++){
    //         var text = game.add.text(35, 40, numberSetToPopulate[i], {fontSize:"30px", fill: '#000000' });
    //         text.visible = true
    //         game.group.children[i].addChild(text)
    //         game.group.children[i].value = numberSetToPopulate[i]
    //         //console.log("Group member value: " + this.group.children[i].value)
    //         game.group.children[i].inputEnabled = true
    //         var temp = game.group.children[i].value

    //         game.group.children[i].events.onInputDown.add(listener, this);
    //         game.group.children[i].events.onInputDown.add(multSet, this);
    //     }
}
