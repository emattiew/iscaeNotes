import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image
} from "@react-pdf/renderer";

import logo from "../assets/logo-iscae.png";


const styles = StyleSheet.create({

    page: {
        padding: 40,
        fontSize: 9,
        fontFamily: "Helvetica",
    },

    header: {
        alignItems: "center",
        marginBottom: 20,
    },

    logo: {
        width: 60,
        height: 60,
        marginBottom: 8,
    },

    university: {
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
    },

    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 20,
        textAlign: "center",
    },

    studentInfo: {
        marginBottom: 20,
    },

    infoRow: {
        flexDirection: "row",
        marginBottom: 5,
    },

    label: {
        fontWeight: "bold",
        width: 130,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 8,
        marginTop: 10,
    },

    table: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#000",
        marginBottom: 15,
    },

    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
    },

    tableHeader: {
        fontWeight: "bold",
        backgroundColor: "#eeeeee",
    },

    cell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: "#000",
    },


    /* Normal layout */

    subject: {
        width: "32%",
    },

    grade: {
        width: "13%",
        textAlign: "center",
    },

    finalGrade: {
        width: "16%",
        textAlign: "center",
    },

    credit: {
        width: "11%",
        textAlign: "center",
    },

    decision: {
        width: "15%",
        textAlign: "center",
    },


    /* Layout when Rattrapage is displayed */
    subjectWithRattrapage: {
        width: "27%",
    },

    gradeWithRattrapage: {
        width: "12%",
        textAlign: "center",
    },

    finalGradeWithRattrapage: {
        width: "14%",
        textAlign: "center",
    },

    rattrapage: {
        width: "13%",
        textAlign: "center",
    },

    creditWithRattrapage: {
        width: "10%",
        textAlign: "center",
    },

    decisionWithRattrapage: {
        width: "12%",
        textAlign: "center",
    },


    annualSummary: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: "flex-start",
    },

    annualText: {
        fontWeight: "bold",
        marginBottom: 6,
    },

    footer: {
        marginTop: 30,
        textAlign: "right",
    },

    /* Annual layout: keep the two semester tables side by side */
    semestersRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
    },

    semesterColumn: {
        width: "48%",
    },

});


export default function AcademicResultPDF({
    student,
    academicYear,
    semesters = [],
    annualAverage,
    annualDecision,
}) {

    const hasRattrapage = semesters.some(
        (semester) =>
            semester.subjects?.some(
                (subject) =>
                    Number(subject.rattrapage || 0) > 0
            )
    );


    return (

        <Document>

            <Page
                size="A4"
                style={styles.page}
            >

                {/* HEADER */}

                <View style={styles.header}>

                    <Image
                        src={logo}
                        style={styles.logo}
                    />

                    <Text style={styles.university}>
                        RÉPUBLIQUE ISLAMIQUE DE MAURITANIE
                    </Text>

                    <Text style={styles.university}>
                        Institut Supérieur de Comptabilité
                    </Text>

                    <Text style={styles.university}>
                        et d'Administration des Entreprises
                    </Text>

                    <Text style={styles.title}>
                        RELEVÉ DE NOTES
                    </Text>

                </View>


                {/* STUDENT INFORMATION */}

                <View style={styles.studentInfo}>

                    <View style={styles.infoRow}>

                        <Text style={styles.label}>
                            Nom et prénom :
                        </Text>

                        <Text>
                            {student?.first_name || ""}{" "}
                            {student?.last_name || ""}
                        </Text>

                    </View>


                    <View style={styles.infoRow}>

                        <Text style={styles.label}>
                            Matricule :
                        </Text>

                        <Text>
                            {student?.matricule || "-"}
                        </Text>

                    </View>


                    <View style={styles.infoRow}>

                        <Text style={styles.label}>
                            Filière :
                        </Text>

                        <Text>
                            {student?.filiere_name || "-"}
                        </Text>

                    </View>


                    <View style={styles.infoRow}>

                        <Text style={styles.label}>
                            Année académique :
                        </Text>

                        <Text>
                            {academicYear || "-"}
                        </Text>

                    </View>

                </View>


                {/* SEMESTERS */}

                <View
                    style={
                        semesters.length === 2
                            ? styles.semestersRow
                            : undefined
                    }
                >
                    {semesters.map(
                        (semester) => (

                            <View
                                key={semester.semester}
                                style={
                                    semesters.length === 2
                                        ? styles.semesterColumn
                                        : undefined
                                }
                            >

                            <Text
                                style={styles.sectionTitle}
                            >
                                Semestre{" "}
                                {semester.semester}
                            </Text>


                            <View
                                style={styles.table}
                            >


                                {/* TABLE HEADER */}

                                <View
                                    style={[
                                        styles.tableRow,
                                        styles.tableHeader
                                    ]}
                                >

                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.subjectWithRattrapage
                                                : styles.subject
                                        ]}
                                    >
                                        Matière
                                    </Text>


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.gradeWithRattrapage
                                                : styles.grade
                                        ]}
                                    >
                                        CC
                                    </Text>


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.gradeWithRattrapage
                                                : styles.grade
                                        ]}
                                    >
                                        CF
                                    </Text>


                                    {/* RATTRAPAGE */}

                                    {hasRattrapage && (

                                        <Text
                                            style={[
                                                styles.cell,
                                                styles.rattrapage
                                            ]}
                                        >
                                            Rattrapage
                                        </Text>

                                    )}


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.finalGradeWithRattrapage
                                                : styles.finalGrade
                                        ]}
                                    >
                                        Note finale
                                    </Text>


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.creditWithRattrapage
                                                : styles.credit
                                        ]}
                                    >
                                        Crédit
                                    </Text>


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.decisionWithRattrapage
                                                : styles.decision
                                        ]}
                                    >
                                        Décision
                                    </Text>

                                </View>


                                {/* SUBJECTS */}

                                {semester.subjects?.map(
                                    (subject) => (

                                        <View
                                            key={subject.id}
                                            style={styles.tableRow}
                                        >

                                            <Text
                                                style={[
                                                    styles.cell,
                                                    hasRattrapage
                                                        ? styles.subjectWithRattrapage
                                                        : styles.subject
                                                ]}
                                            >
                                                {
                                                    subject.name
                                                }
                                            </Text>


                                            <Text
                                                style={[
                                                    styles.cell,
                                                    hasRattrapage
                                                        ? styles.gradeWithRattrapage
                                                        : styles.grade
                                                ]}
                                            >
                                                {
                                                    subject.controle_continu ??
                                                    "-"
                                                }
                                            </Text>


                                            <Text
                                                style={[
                                                    styles.cell,
                                                    hasRattrapage
                                                        ? styles.gradeWithRattrapage
                                                        : styles.grade
                                                ]}
                                            >
                                                {
                                                    subject.controle_final ??
                                                    "-"
                                                }
                                            </Text>


                                            {/* RATTRAPAGE */}

                                            {hasRattrapage && (

                                                <Text
                                                    style={[
                                                        styles.cell,
                                                        styles.rattrapage
                                                    ]}
                                                >
                                                    {
                                                        Number(
                                                            subject.rattrapage || 0
                                                        ) > 0

                                                            ? Number(
                                                                subject.rattrapage
                                                            ).toFixed(2)

                                                            : "-"
                                                    }
                                                </Text>

                                            )}


                                            <Text
                                                style={[
                                                    styles.cell,
                                                    hasRattrapage
                                                        ? styles.finalGradeWithRattrapage
                                                        : styles.finalGrade
                                                ]}
                                            >
                                                {
                                                    subject.note ??
                                                    "-"
                                                }
                                            </Text>


                                            <Text
                                                style={[
                                                    styles.cell,
                                                    hasRattrapage
                                                        ? styles.creditWithRattrapage
                                                        : styles.credit
                                                ]}
                                            >
                                                {
                                                    subject.credit ??
                                                    "-"
                                                }
                                            </Text>


                                            <Text
                                                style={[
                                                    styles.cell,
                                                    hasRattrapage
                                                        ? styles.decisionWithRattrapage
                                                        : styles.decision
                                                ]}
                                            >
                                                {
                                                    subject.decision ??
                                                    "-"
                                                }
                                            </Text>

                                        </View>

                                    )
                                )}


                                {/* SEMESTER AVERAGE */}

                                <View
                                    style={styles.tableRow}
                                >

                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.subjectWithRattrapage
                                                : styles.subject
                                        ]}
                                    >
                                        Moyenne du semestre
                                    </Text>


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.gradeWithRattrapage
                                                : styles.grade
                                        ]}
                                    >
                                        -
                                    </Text>


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.gradeWithRattrapage
                                                : styles.grade
                                        ]}
                                    >
                                        -
                                    </Text>


                                    {/* RATTRAPAGE EMPTY CELL */}

                                    {hasRattrapage && (

                                        <Text
                                            style={[
                                                styles.cell,
                                                styles.rattrapage
                                            ]}
                                        >
                                            -
                                        </Text>

                                    )}


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.finalGradeWithRattrapage
                                                : styles.finalGrade
                                        ]}
                                    >
                                        {
                                            semester.average ??
                                            "-"
                                        }
                                    </Text>


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.creditWithRattrapage
                                                : styles.credit
                                        ]}
                                    >
                                        -
                                    </Text>


                                    <Text
                                        style={[
                                            styles.cell,
                                            hasRattrapage
                                                ? styles.decisionWithRattrapage
                                                : styles.decision
                                        ]}
                                    >
                                        {
                                            semester.decision ??
                                            "-"
                                        }
                                    </Text>

                                </View>


                            </View>

                            </View>

                        )
                    )}
                </View>


                {/* ANNUAL SUMMARY */}

                <View
                    style={styles.annualSummary}
                >

                    <Text
                        style={styles.annualText}
                    >
                        Moyenne annuelle :{" "}
                        {annualAverage || "-"}
                    </Text>


                    <Text
                        style={styles.annualText}
                    >
                        Décision du jury :{" "}
                        {annualDecision || "-"}
                    </Text>

                </View>


                {/* FOOTER */}

                <View
                    style={styles.footer}
                >

                    <Text>
                        Document académique
                    </Text>

                </View>

            </Page>

        </Document>
    );
}