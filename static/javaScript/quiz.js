$(
    $('.opt').click( (evt) => {
        let optionSelected = $(evt.target).text();
        let questionID = $(evt.target).parent().parent().parent().find('#secondCol').find('.id').val()
        console.log(questionID)
        let dataToSend = {
            option: optionSelected,
            id: questionID
        }
        $.ajax({
            type: "POST",
            url: "/quiz",
            data: dataToSend,
            success: (res) => {
                $(evt.target).parent().parent().parent().fadeOut('slow')
                $('form').fadeOut('slow', () => {
                $('form').fadeIn('slow')
                })
            }
        })       
    })
)