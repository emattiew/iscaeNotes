import api from "./api";

export const getExams = () => {

    return api.get(
        "/ai-correction/exams/"
    );

};

export const createExam = (data) => {

    return api.post(
        "/ai-correction/exams/",
        data
    );

};

export const getMatieres = () => {

    return api.get(
        "/notes/matieres/"
    );

};
export const uploadExamSheet = (data) => {

    return api.post(
        "/ai-correction/exam-sheets/",
        data,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

};

export const processExamOCR = (id) => {

    return api.post(
        `/ai-correction/exam-sheets/${id}/process_ocr/`
    );

};

export const extractQuestions = (id) => {

    return api.post(
        `/ai-correction/exam-sheets/${id}/extract_questions/`
    );

};

export const validateQuestions = (id, data) => {

    return api.post(
        `/ai-correction/exam-sheets/${id}/validate_questions/`,
        data
    );

};
export const uploadCorrectionSheet = (data) => {

    return api.post(

        "/ai-correction/correction-sheets/",

        data,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

};

export const processCorrectionOCR = (id) => {

    return api.post(

        `/ai-correction/correction-sheets/${id}/process_ocr/`

    );

};

export const extractExpectedAnswers = (id) => {

    return api.post(

        `/ai-correction/correction-sheets/${id}/extract_expected_answers/`

    );

};

export const validateExpectedAnswers = (id, data) => {

    return api.post(

        `/ai-correction/correction-sheets/${id}/validate_expected_answers/`,

        data

    );

};