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
                    file(
                        credentialsId: 'backend-env-file',
                        variable: 'BACKEND_ENV_FILE'
                    )
                ]) {
                    sh '''
                        cp "$BACKEND_ENV_FILE" backend/.env

                        echo "Checking environment file structure..."

                        grep -q '^SECRET_KEY=' backend/.env && echo "SECRET_KEY: OK" || echo "SECRET_KEY: MISSING"
                        grep -q '^DEBUG=' backend/.env && echo "DEBUG: OK" || echo "DEBUG: MISSING"
                        grep -q '^DB_NAME=' backend/.env && echo "DB_NAME: OK" || echo "DB_NAME: MISSING"
                        grep -q '^DB_USER=' backend/.env && echo "DB_USER: OK" || echo "DB_USER: MISSING"
                        grep -q '^DB_PASSWORD=' backend/.env && echo "DB_PASSWORD: OK" || echo "DB_PASSWORD: MISSING"
                        grep -q '^DB_HOST=' backend/.env && echo "DB_HOST: OK" || echo "DB_HOST: MISSING"
                        grep -q '^DB_PORT=' backend/.env && echo "DB_PORT: OK" || echo "DB_PORT: MISSING"
                        grep -q '^GEMINI_API_KEY=' backend/.env && echo "GEMINI_API_KEY: OK" || echo "GEMINI_API_KEY: MISSING"

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
