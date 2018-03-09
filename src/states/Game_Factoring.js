/**
 * @file: Game_Factoring.js
 * Purpose: Game instance for factoring game
 * Authors: Jieni Hou, Jason Lee, Jose Rivera
 * Language: ES6
 */
import Phaser from 'phaser'

export default class extends Phaser.State {
    init() {
    }

    //Load scene assets to display
    preload() {
        this.load.image('Jungle', '../../assets/images/background_jungle.jpg')
        this.load.image('Banana', '../../assets/images/banana_small.png')
        this.load.image('Arrow', '../../assets/images/arrow_yellow.png')
        this.load.image('menu', '../../assets/images/pause-b.png')
        this.load.spritesheet('Monkey', '../../assets/images/user-monkey-spritesheet.png',228 ,305, 4)
    }

    
    create() {
        //----------------------------------------------UI COMPONENT---------------------------------------------
        //Display background in scene
        var Background = this.add.image(0, 0, 'Jungle')

        //Apply ARCADE physics for all game components in this state
        this.physics.startSystem(Phaser.Physics.ARCADE)

        //Reference Monkey sprite sheet as image of game and bring into the scene and animate
        this.UserMonkey = this.add.sprite(this.world.centerX, this.world._height, 'Monkey')
        this.UserMonkey.anchor.setTo(0.5, 0.5)
        this.UserMonkey.animations.add('walk')
        this.UserMonkey.animations.play('walk', 5, true)

 
        //Enable body property and ARCADE physics on monkey sprite
        this.UserMonkey.enableBody = true
        this.physics.enable(this.UserMonkey, Phaser.Physics.ARCADE)
        
        //Collider to keep monkey in bounds
        this.UserMonkey.body.collideWorldBounds = true

        //Creation of arrow button to exit state and return to game selection
        this.Back_Arrow = this.add.button(this.world.centerX * 0.1, this.world.centerY * 0.1, 'Arrow', actionGoBack, this)
        this.Back_Arrow.anchor.setTo(0.5, 0.5)

        //---------------------------------------------BANANA COMPONENTS-----------------------------------------
        //Spawn Banana at top boundary of world at random x co-ordinate within provided range
        this.Banana = this.add.sprite(this.rnd.integerInRange(0, this.world.width), 0, 'Banana')
        this.Banana.inputEnabled = true;
        this.physics.enable(this.Banana, Phaser.Physics.ARCADE)

        // Set gravity and make sure banana is reset once it leaves world bounds or is killed
        this.Banana.body.gravity.y = 50
        this.Banana.checkWorldBounds = true;
        this.Banana.events.onOutOfBounds.add(banana_out, this)
        this.Banana.events.onKilled.add(banana_out, this)   //Code Line for testing collision//

        //Add text component to display numbers on falling bananas
        var text = this.add.text(20,30,"Number",
            {font: "16px Arial",
             fontWeight: "bold",
             fill: "#FFFFFF",
             boundsAlignH:"right",
             boundsAlignV: "bottom"})
        this.Banana.addChild(text)

        //----------------------------------------------PLAYER CONTROLS------------------------------------------
        //Map D key to move monkey to the right
        this.key_D = this.input.keyboard.addKey(Phaser.Keyboard.D)

        //Map A key to move monkey to the left
        this.key_A = this.input.keyboard.addKey(Phaser.Keyboard.A)

        //Map LEFT arrow key to move monkey to the left
        this.key_LEFT = this.input.keyboard.addKey(Phaser.Keyboard.LEFT)

        //Map RIGHT arrow key to move monkey to the right
        this.key_RIGHT = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT)

        //--------------------------------------------PAUSE MENU COMPONENT------------------------------------------
        var w = this.world.width, h = this.world.height;
        var menu, choiseLabel;
        
        //Create a label to use as a button
        var pause_label = this.add.text(this.world.centerX , this.world.centerY * 0.1, 'Pause',
            { font: '24px Arial',
              fontWeight: "bold",
                fill: '#fff',
            });
        pause_label.inputEnabled = true;

        pause_label.events.onInputUp.add(function () {
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

    
    update(delta) {
        //Button animation for back arrow and pause
        if (this.Back_Arrow.input.pointerOver())
        {
            this.Back_Arrow.scale.setTo(1.1,1.1)
        }
        else
        {
            this.Back_Arrow.scale.setTo(1,1)
        }

        //Update function to update monkey's movement between frames
        //Left movement
        if (this.key_A.isDown) {
            this.UserMonkey.x -= 15
        }
        if (this.key_LEFT.isDown) {
            this.UserMonkey.x -= 15
        }
        //Right movement
        if (this.key_D.isDown) {
            this.UserMonkey.x += 15
        }
        if (this.key_RIGHT.isDown) {
            this.UserMonkey.x += 15
        }

        //Check collision with UserMonkey and Banana
        this.physics.arcade.collide(this.UserMonkey, this.Banana, collisionHandler, null, this);
    }
}

//If objects collide, destroy second object
function collisionHandler(object1, object2){
    object2.kill()
}

//Function called on ARROW button to return to 'GameSelect' screen
function actionGoBack () {
    this.state.start('GameSelect')
}

//Function to reset banana position once it leaves world boundary
function banana_out(Banana){
    this.Banana.reset(this.rnd.integerInRange(0,game.width), 0)
}

