const mon = require('mongoose')

const questions = mon.Schema({
    question: {
        type: String,
        required: [true, 'Please Enter Your Question']
    },

    option1: {
        type: String,
        required: [true, 'Please Enter Option']
    },

    option2: {
        type: String,
        required: [true, 'Please Enter Option']
    },

    option3: {
        type: String,
        required: [true, 'Please Enter Option']
    },

    option4: {
        type: String,
        required: [true, 'Please Enter Option']
    },

    correct: {
        type: String,
        required: [true, 'Please Enter Correct Option']
    }




})

questions.methods.getQuestion = () => {
    return(this.question)
}

const authIps = mon.Schema({
    ip: String
})


module.exports = [
    mon.model('question', questions),
    mon.model('authip', authIps),
    
]