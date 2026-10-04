pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Environment') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'backend-env',
                        variable: 'BACKEND_ENV'
                    )
                ]) {
                    sh '''
                        printf '%s\\n' "$BACKEND_ENV" > backend/.env
                        grep '^DB_PASSWORD=' backend/.env > .env
                    '''
                }
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    docker compose -p iscae_notes up -d db
                    docker compose -p iscae_notes run --rm backend python manage.py test apps.notes.tests
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                sh '''
                    docker compose -p iscae_notes build frontend
                '''
            }
        }

        stage('Backend Build') {
            steps {
                sh '''
                    docker compose -p iscae_notes build backend
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose -p iscae_notes up -d
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    docker compose -p iscae_notes ps
                '''
            }
        }
    }

    post {
        always {
            sh 'rm -f .env backend/.env || true'
        }
    }
}
