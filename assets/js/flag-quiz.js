const LEVEL_TIMERS = {
    easy: 60,
    medium: 30,
    hard: 10,
};

const LEVEL_STAGES  = {
    easy: 5,
    medium: 10,
    hard: 20,
};

const FLAG_PREFIX   = 'assets/images/flags/flag-square-500';
const FLAG_IMG_TYPE = 'png';
const FLAGS         = [
    'Europe',
    'Brazil',
    'Indonesia',
    'Nigeria',
    'Bangladesh',
    'Japan',
    'Egypt',
    'Congo',
    'Ethiopia',
    'Philippines',
    'Iran',
    'Turkey',
    'Thailand',
    'Germany',
    'Vietnam',
    'Myanmar',
    'Colombia',
    'SouthAfrica',
    'Italy',
    'Algeria',
    'China',
    'Pakistan',
    'India',
    'Canada',
    'Kenya',
    'Russia',
    'Venezuela',
    'Sudan',
    'Mexico',
    'ArabLeague',
    'UnitedKingdom',
    'Peru',
    'France',
    'Malaysia',
    'Mozambique',
    'Uzebekistan',
    'Uganda',
    'Tanzania',
    'Cameroon',
    'Madagascar',
    "Coted'Ivoire",
    'Spain',
    'Australia',
    'Romania',
    'BurkinaFaso',
    'Niger',
    'SriLanka',
    'Poland',
    'Iraq',
    'England',
    'Chile',
    'Ecuador',
    'Ukraine',
    'Mali',
    'Morocco',
    'Argentina',
    'Zimbabwe',
    'Angola',
    'Zambia',
    'Guinea',
    'Chad',
    'SaudiArabia',
    'Yemen',
    'Nepal',
    'Ghana',
    'Burundi',
    'Afghanistan',
    'Somalia',
    'Taiwan',
    'Benin',
    'DominicanRepublic',
    'CzechRepublic',
    'NorthKorea',
    'Rwanda',
    'Portugal',
    'Syria',
    'Azerbajian',
    'Malawi',
    'Jordan',
    'Israel',
    'Netherlands',
    'Hungary',
    'Tajikistan',
    'Kazakhstan',
    'Guatemala',
    'Togo',
    'Cambodia',
    'HongKong',
    'Bulgaria',
    'Paraguay',
    'PapuaNewGuinea',
    'Senegal',
    'SouthSudan',
    'Tunisia',
    'ElSalvador',
    'Nicaragua',
    'Bolivia',
    'Singapore',
    'UnitedArabEmirates',
    'SouthKorea'
];

let BLANK_FIELD   = `<div>
                        <label for="code-1" class="sr-only">First code</label>
                        <input type="text" maxlength="1" data-focus-input-init data-focus-input-next="code-2" id="code-1" class="blank block w-16 h-16 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" style="font-size: 24px;" required />
                    </div>`;

let LEVEL          = null;
let LEVEL_TIMER    = null;
let TIMER_INTERVAL = null;

let STAGES          = [];
let STAGE_COUNT     = null;
let CURRENT_STAGE   = 0;
let STAGE_INFO      = null;

let ANSWER          = [];
let CORRECT_ANSWERS = [];

function arrayShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]]; 
    } 

    return array; 
}

function displayContainer(target) {
    $('.section-container').removeClass('active').addClass('hidden');
    $(`.${target}`).addClass('active').removeClass('hidden');
}

function initGame() {
    let flagsFlipped = Object.fromEntries(Object.entries(FLAGS).map(a => a.reverse()));
    let flags        = arrayShuffle(FLAGS).slice(0, STAGE_COUNT);

    $.each(flags, function(i, flag) {
        let index = parseInt(flagsFlipped[flag]);
        STAGES.push({
            index: index,
            name: flag,
            length: flag.length,
            src: `${FLAG_PREFIX}_${index+1}.${FLAG_IMG_TYPE}`
        });
    });

    CURRENT_STAGE = 0;
    nextStage();
}

function nextStage() {    
    if(CURRENT_STAGE == STAGES.length) {
        clearInterval(TIMER_INTERVAL);

        setTimeout(function() {
            $('.score').html(CORRECT_ANSWERS.length);
            $('.score-message').html('great job! :)');

            if(CORRECT_ANSWERS.length < ((STAGE_COUNT / 3) * 2)) {
                $('.score-message').html('better luck next time :(');
                playSound('game-over');
            } else {
                playSound('great-job');
            }

            displayContainer('score-container');
        }, 1000);
        
        return false;
    }

    $('.stage').html(CURRENT_STAGE + 1);
    STAGE_INFO = STAGES[CURRENT_STAGE] ?? null;
    if(STAGE_INFO == null) {
        return;
    }

    // Change flag
    $('.flag-container').attr('src', STAGE_INFO.src);
    
    // Empty fields
    $('.fill-in-the-blanks').empty();
    $('.fill-in-the-blanks').removeClass('animate__wobble');

    // Append new fields
    ANSWER = [];
    for(i = 0; i < STAGE_INFO.length; i++) {
        let field = `<div>
                        <label for="code-1" class="sr-only">First code</label>
                        <input type="text" maxlength="1" data-focus-input-init data-focus-input-next="code-2" id="code-1" class="blank block w-16 h-16 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" style="font-size: 24px; text-transform: uppercase;" required />
                    </div>`;
        
        $('.fill-in-the-blanks').append(field);
        $('.fill-in-the-blanks').find('div').last().find('label').attr('for', `code-${i+1}`);
        $('.fill-in-the-blanks').find('div').last().find('input').attr('id', `code-${i+1}`);
        $('.fill-in-the-blanks').find('div').last().find('input').attr('data-focus-input-next', `code-${i+2}`);

        let dividend = LEVEL === 'easy' ? 2 : 3;
        if(Math.random() < 0.5 && (LEVEL === 'easy' || LEVEL === 'medium') && Object.values(ANSWER).length < (STAGE_INFO.length / dividend) ) {
            $('.fill-in-the-blanks').find('div').last().find('input').val(STAGE_INFO.name.charAt(i));
            
            if(LEVEL === 'easy') {
                $('.fill-in-the-blanks').find('div').last().find('input').removeClass('border-gray-300').addClass('border-green-700');
            }

            ANSWER[i] = STAGE_INFO.name.charAt(i);
        }
    }

    // Start timer
    $('.timer').attr('style', `--value:${LEVEL_TIMER};`);

    let timer = LEVEL_TIMER;
    TIMER_INTERVAL = setInterval(() => {
		if(timer>0){
			timer--;
		}

        $('.timer').attr('style', `--value:${timer};`);

        if(timer === 0) {
            CURRENT_STAGE++;

            playSound('incorrect');

            clearInterval(TIMER_INTERVAL);
            nextStage();
        }
    }, 1000);

    // Add listener to fields
    $(document).on('keydown', '.blank', function(e) {
        let keyCode = e.keyCode || e.which;
        let char    = String.fromCharCode(keyCode);

        if(keyCode === 8) {
            let index = $('.fill-in-the-blanks div').index($(this).parent());

            if((index - 1) < -1) {
                $($('.blank')[index - 1]).focus();
            }
            
            return;
        }

        $(this).val(char);
    });

    $(document).on('keyup', '.blank', function(e) {
        checkFields($(this), e, TIMER_INTERVAL);
    });

    $('.blank').last().on('keyup', function(e) {
        checkFields($(this), e, TIMER_INTERVAL);
    });
}

function checkFields(field, e, TIMER_INTERVAL) {
    let index = $('.fill-in-the-blanks div').index($(field).parent());
    if($(field).val() == '' || index < 0) {
        $(field).removeClass('border-gray-300').addClass('border-red-700');
        return;
    };

    ANSWER[index] = $(field).val();
    if(LEVEL === 'easy') {
        if((ANSWER[index]).toLowerCase() == STAGE_INFO.name.charAt(index).toLowerCase()) {
            $(field).removeClass('border-gray-300').removeClass('border-red-700').addClass('border-green-700');
        } else {
            $(field).removeClass('border-gray-300').removeClass('border-green-700').addClass('border-red-700');
        }
    }

    let keyCode = e.keyCode || e.which;
    if (((keyCode == 8) == false) && ((keyCode >= 35 && keyCode <= 40) == false)) { // Left / Up / Right / Down Arrow, Backspace, Delete keys
        $($('.blank')[index + 1]).focus();
    }

    checkAnswer(TIMER_INTERVAL);
}

function checkAnswer(TIMER_INTERVAL) {
    $('.fill-in-the-blanks').removeClass('animate__animated').removeClass('animate__wobble');

    if(Object.values(ANSWER).length == STAGE_INFO.length) {
        if(ANSWER.join('').toLowerCase() == STAGE_INFO.name.toLowerCase()) {
            $('.blank').removeClass('border-gray-300').addClass('border-green-700');

            if(CURRENT_STAGE < STAGES.length) {
                CURRENT_STAGE++;
            }

            if(CORRECT_ANSWERS.includes(STAGE_INFO.name) == false) {
                CORRECT_ANSWERS.push(STAGE_INFO.name);
            }
            
            playSound('correct');
            clearInterval(TIMER_INTERVAL);
            nextStage();
        } else {
            $('.fill-in-the-blanks').addClass('animate__animated').addClass('animate__wobble');
            $('.blank').removeClass('border-gray-300').addClass('border-red-700');

            setTimeout(function() {
                $('.fill-in-the-blanks').removeClass('animate__animated').removeClass('animate__wobble');
            }, 2000);

            playSound('incorrect');
        }
    }
}

function playSound(sound) {
    if(sound == 'correct') {
        let audio = new Audio('assets/sounds/collect-points.mp3');
        audio.play();
    }

    if(sound == 'incorrect') {
        let audio = new Audio('assets/sounds/failure-drum.mp3');
        audio.play();
    }

    if(sound == 'good') {
        let audio = new Audio('assets/sounds/good.mp3');
        audio.play();
    }

    if(sound == 'great-job') {
        let audio = new Audio('assets/sounds/winning.mp3');
        audio.play();
    }

    if(sound == 'game-over') {
        let audio = new Audio('assets/sounds/game-over.mp3');
        audio.play();
    }
}

$(document).ready(function() {
    $('.btn-choose-mode').on('click', function(e) {
        if($('.section-container.active').hasClass('score-container')) {
            location.reload();
            return false;
        }

        displayContainer($(this).data('target-container'));
        playSound('good');
    });

    $('.btn-start').on('click', function(e) {
        playSound('good');

        LEVEL         = $(this).data('game-level');
        LEVEL_TIMER   = LEVEL_TIMERS[LEVEL] ?? 60;
        STAGE_COUNT   = LEVEL_STAGES[LEVEL] ?? 60;

        $('.timer').attr('style', `--value:${LEVEL_TIMER};`);
        $('.total-stage').html(STAGE_COUNT);
        displayContainer($(this).data('target-container'));

        initGame();
    });
});