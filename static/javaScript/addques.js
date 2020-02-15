$(
    $('.flash').fadeOut(),

    $('.save').click( (e) => {
        $('.flash').fadeOut()
        let ques = $('.question').val()
        let op1 = $('#op1').val()
        let op2 = $('#op2').val()
        let op3 = $('#op3').val()
        let op4 = $('#op4').val()
        let cor = $('.correct').val()
        $('.question').val('')
        $('#op1').val('')
        $('#op2').val('')
        $('#op3').val('')
        $('#op4').val('')
        $('.correct').val('')
        let dataToSave = {
            question: ques,
            option1: op1, 
            option2: op2, 
            option3: op3, 
            option4: op4,
            correct: cor
        }
        if(ques != '' & op1 != '' & op2 != '' & op3 != '' & op4 != '')
            $.ajax({
                type: "POST",
                url: "/add-questions",
                data: dataToSave,
                async: false,
                success: function (response) {
                    $('.flash').html('Added Successfully')
                    $('.flash').fadeIn('slow', 'linear', () => {
                        setTimeout(() => {
                            $('.flash').fadeOut('slow', 'linear', () => {
                                $('.flash').html(response)
                                $('.flash').css({color: 'rgb(184, 78, 78)'})
                                $('.flash').fadeIn('slow')

                                

                            })

                        },3000)
                    })
                    console.log(response)
                }
            }
        );
    })

)

$('input').on('keypress', (e) => {
    if(e.key == 'Enter'){
        $('.flash').fadeOut()
        let ques = $('.question').val()
        let op1 = $('#op1').val()
        let op2 = $('#op2').val()
        let op3 = $('#op3').val()
        let op4 = $('#op4').val()
        let cor = $('.correct').val()
        if(confirm('Are You Sure?') == true){   
            $('.question').val('')
            $('#op1').val('')
            $('#op2').val('')
            $('#op3').val('')
            $('#op4').val('')
            let dataToSave = {
                question: ques,
                option1: op1, 
                option2: op2, 
                option3: op3, 
                option4: op4,
                correct: cor
            }
            if(ques != '' & op1 != '' & op2 != '' & op3 != '' & op4 != '')
                $.ajax({
                    type: "POST",
                    url: "/add-questions",
                    data: dataToSave,
                    async: false,
                    success: function (response) {
                        $('.flash').html('Added Successfully')
                        $('.flash').fadeIn('slow', 'linear', () => {
                            setTimeout(() => {
                                $('.flash').fadeOut('slow', 'linear', () => {
                                    $('.flash').html(response)
                                    $('.flash').css({color: 'rgb(184, 78, 78)'})
                                    $('.flash').fadeIn('slow')
                                })

                            },3000)
                        })
                        console.log(response)
                    }
                }
            );
        }
    }    
})
