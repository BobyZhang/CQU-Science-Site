(function ($) {
    $.fn.jquizzy = function (settings) {
        var defaults = {
            questions: null,
            startImg: 'quiz/images/start.gif',
            endText: '',
            shortURL: null,
            sendResultsURL: null,
            resultComments: {
                perfect: '您的科学素养很高，国家的未来就靠您了！',
                excellent: '科学素养较高，祖国建设很需要您这样的人。',
                good: '科学素养还行。',
                average: '将就，还是需要加强学习。',
                bad: '一般般，平时需要加强学习。',
                poor: '建议重新去读中学。',
                worse: '建议重新去读小学。',
                worst: '无语了！'
            }
        };
        var config = $.extend(defaults, settings);
        if (config.questions === null) {
            $(this).html('<div class="intro-container slide-container"><h2 class="qTitle">Failed to parse questions.</h2></div>');
            return;
        }
        var superContainer = $(this),
            answers = [],
            introFob = '	<div class="intro-container slide-container"><a class="nav-start" href="#">几分钟测试您的科学素养！准备好了吗?<br/><br/><span><input type="button" class="start-to-test btn-test" value="开始做题"></span></a></div>	',
            exitFob = '<div class="results-container slide-container"><div class="question-number">' + config.endText + '</div><div class="result-keeper"></div></div><div class="notice">请选择一个选项！</div><div class="progress-keeper" ><div class="progress"></div></div>',
            contentFob = '',
            questionsIteratorIndex,
            answersIteratorIndex;
        superContainer.addClass('main-quiz-holder');
        for (questionsIteratorIndex = 0; questionsIteratorIndex < config.questions.length; questionsIteratorIndex++) {
            contentFob += '<div class="slide-container"><div class="question-number">' + (questionsIteratorIndex + 1) + '/' + config.questions.length + '</div><div class="question">' + config.questions[questionsIteratorIndex].question + '</div><ul class="answers">';
            for (answersIteratorIndex = 0; answersIteratorIndex < config.questions[questionsIteratorIndex].answers.length; answersIteratorIndex++) {
                contentFob += '<li>' + config.questions[questionsIteratorIndex].answers[answersIteratorIndex] + '</li>';
            }
            contentFob += '</ul><div class="nav-container">';
            if (questionsIteratorIndex !== 0) {
                contentFob += '<div class="prev"><a class="nav-previous btn-test" href="#">< 上一题</a></div>';
            }
            if (questionsIteratorIndex < config.questions.length - 1) {
                contentFob += '<div class="next "><a class="nav-next btn-test" href="#">下一题 ></a></div>';
            } else {
                contentFob += '<div class="next final"><a class="nav-show-result btn-test btn-finish" href="#">完成</a></div>';
            }
            contentFob += '</div></div>';
            answers.push(config.questions[questionsIteratorIndex].correctAnswer);
        }
        superContainer.html(introFob + contentFob + exitFob);
        var progress = superContainer.find('.progress'),
            progressKeeper = superContainer.find('.progress-keeper'),
            notice = superContainer.find('.notice'),
            progressWidth = progressKeeper.width(),
            userAnswers = [],
            questionLength = config.questions.length,
            slidesList = superContainer.find('.slide-container');

        function checkAnswers() {
            var resultArr = [],
                flag = false;
            for (i = 0; i < answers.length; i++) {
                if (answers[i] == userAnswers[i]) {
                    flag = true;
                } else {
                    flag = false;
                }
                resultArr.push(flag);
            }
            return resultArr;
        }

        function roundReloaded(num, dec) {
            var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
            return result;
        }

        function judgeSkills(score) {
            var returnString;
            if (score >= 90) return config.resultComments.perfect;
            else if (score >=80) return config.resultComments.excellent;
            else if (score >=70) return config.resultComments.good;
            else if (score >=60) return config.resultComments.average;
            else if (score >=50) return config.resultComments.bad;
            else if (score >=40) return config.resultComments.poor;
            else if (score >=30) return config.resultComments.worse;
            else return config.resultComments.worst;
        }

        progressKeeper.hide();
        notice.hide();
        slidesList.hide().first().fadeIn(500);
        superContainer.find('li').click(function () {
            var thisLi = $(this);
            if (thisLi.hasClass('selected')) {
                thisLi.removeClass('selected');
            } else {
                thisLi.parents('.answers').children('li').removeClass('selected');
                thisLi.addClass('selected');
            }
        });
        superContainer.find('.nav-start').click(function () {
            $(this).parents('.slide-container').fadeOut(500,
                function () {
                    $(this).next().fadeIn(500);
                    progressKeeper.fadeIn(500);
                });
            return false;
        });
        superContainer.find('.next').click(function () {
            if ($(this).parents('.slide-container').find('li.selected').length === 0) {
                notice.fadeIn(300);
                return false;
            }
            notice.hide();
            $(this).parents('.slide-container').fadeOut(500,
                function () {
                    $(this).next().fadeIn(500);
                });
            progress.animate({
                    width: progress.width() + Math.round(progressWidth / questionLength)
                },
                500);
            return false;
        });
        superContainer.find('.prev').click(function () {
            notice.hide();
            $(this).parents('.slide-container').fadeOut(500,
                function () {
                    $(this).prev().fadeIn(500);
                });
            progress.animate({
                    width: progress.width() - Math.round(progressWidth / questionLength)
                },
                500);
            return false;
        });
        superContainer.find('.final').click(function () {
            if ($(this).parents('.slide-container').find('li.selected').length === 0) {
                notice.fadeIn(300);
                return false;
            }
            superContainer.find('li.selected').each(function (index) {
                userAnswers.push($(this).parents('.answers').children('li').index($(this).parents('.answers').find('li.selected')) + 1);
            });
            if (config.sendResultsURL !== null) {
                var collate = [];
                for (r = 0; r < userAnswers.length; r++) {
                    collate.push('{"questionNumber":"' + parseInt(r + 1, 10) + '", "userAnswer":"' + userAnswers[r] + '"}');
                }
                $.ajax({
                    type: 'POST',
                    url: config.sendResultsURL,
                    data: '{"answers": [' + collate.join(",") + ']}',
                    complete: function () {
                        console.log("OH HAI");
                    }
                });
            }
            progressKeeper.hide();
            var results = checkAnswers(),
                resultSet = '',
                trueCount = 0,
                shareButton = '',
                score,
                url;
            if (config.shortURL === null) {
                config.shortURL = window.location
            }
            ;
            for (var i = 0,
                     toLoopTill = results.length; i < toLoopTill; i++) {
                if (results[i] === true) {
                    trueCount++;
                    isCorrect = true;
                }
                resultSet += '<div class="result-row">' + (results[i] === true ? "<div class='correct'>" + (i + 1) + "<span></span></div>" : "<div class='wrong'>" + (i + 1) + "<span></span></div>");//结尾对错
                resultSet += '<div class="resultsview-qhover">' + config.questions[i].question;    //结尾答案框
                if(config.questions[i].correctAnswer==1)
                {
                    resultSet += "<br/><b>正确答案是：A</b>";
                }
                if(config.questions[i].correctAnswer==2)
                {
                    resultSet += "<br/><b>正确答案是：B</b>";
                }
                if(config.questions[i].correctAnswer==3)
                {
                    resultSet += "<br/><b>正确答案是：C</b>";
                }
                if(config.questions[i].correctAnswer==4)
                {
                    resultSet += "<br/><b>正确答案是：D</b>";
                }

                resultSet += "<ul>";
                for (answersIteratorIndex = 0; answersIteratorIndex < config.questions[i].answers.length; answersIteratorIndex++) {
                    var classestoAdd = '';
                    if (config.questions[i].correctAnswer == answersIteratorIndex + 1) {
                        classestoAdd += 'right';
                    }
                    if (userAnswers[i] == answersIteratorIndex + 1) {
                        classestoAdd += ' selected';
                    }
                    resultSet += '<li class="' + classestoAdd + '">' + config.questions[i].answers[answersIteratorIndex] + '</li>';
                }
                resultSet += '</ul></div></div>';
            }
            score = roundReloaded(trueCount / questionLength * 100, 2);

            resultSet = '<h2 class="qTitle">' + judgeSkills(score) + '<br/> 您的分数： ' + score + '</h2>' + shareButton + '<div class="jquizzy-clear"></div>' + resultSet + '<div class="jquizzy-clear"></div>';
            superContainer.find('.result-keeper').html(resultSet).show(500);
            superContainer.find('.resultsview-qhover').hide();
            superContainer.find('.result-row').hover(function () {
                    $(this).find('.resultsview-qhover').show();
                },
                function () {
                    $(this).find('.resultsview-qhover').hide();
                });
            $(this).parents('.slide-container').fadeOut(500,
                function () {
                    $(this).next().fadeIn(500);
                });
            return false;
        });
    };
})(jQuery);