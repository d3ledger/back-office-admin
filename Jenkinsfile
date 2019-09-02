def tag = ["master":"latest", "develop":"develop" ]
pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timestamps()
        disableConcurrentBuilds()
    }
    agent { label 'd3-build-agent' }
    stages {
        stage('Build') {
            when {
                beforeAgent true
                expression { return (env.GIT_BRANCH in tag || env.TAG_NAME) }
            }
            agent { label 'd3-build-agent' }
            steps {
                script {
                    docker_tag = env.TAG_NAME ? env.TAG_NAME : tag[env.GIT_BRANCH]
                    def iC = docker.build("nexus.iroha.tech:19002/d3-deploy/back-office:${tag[env.GIT_BRANCH]}")
                    docker.withRegistry('https://nexus.iroha.tech:19002', 'nexus-d3-docker') {
                        iC.push()
                    }
                }
            }
        }
    }
    post {
        cleanup {
            cleanWs()
        }
    }
}