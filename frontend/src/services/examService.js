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

export const getCollectes = () => {

    return api.get(

        "/notes/collectes/"

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

export const getExamStudents = (id) => {

    return api.get(

        `/ai-correction/exams/${id}/students/`

    );

};
export const uploadExamCopy = (data) => {

    return api.post(

        "/ai-correction/copies/",

        data,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

};

export const processExamCopyOCR = (id) => {

    return api.post(

        `/ai-correction/copies/${id}/process_ocr/`

    );

};

export const extractAnswers = (id) => {

    return api.post(

        `/ai-correction/copies/${id}/extract_answers/`

    );

};

export const evaluateExamCopy = (id) => {

    return api.post(

        `/ai-correction/copies/${id}/evaluate/`

    );

};
export const getCorrections = (copyId) => {

    return api.get(

        `/ai-correction/corrections/?copy=${copyId}`

    );

};

export const validateCorrections = (data) => {

    return api.post(

        "/ai-correction/corrections/validate/",

        data

    );

};

export const getPreparationData = (id) => {

    return api.get(

        `/ai-correction/exams/${id}/preparation/`

    );

};
export const getStudentCopy = (examId, studentId) => {

    return api.get(

        `/ai-correction/exams/${examId}/student-copy/${studentId}/`

    );

};