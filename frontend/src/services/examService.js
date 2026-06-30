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