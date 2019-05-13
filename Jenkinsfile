import java.text.SimpleDateFormat
import hudson.console.ModelHyperlinkNote
import java.util.logging.Logger

properties([
  parameters([
    string(name: 'GIT_BRANCH', defaultValue: 'master', description: 'GIT_BRANCH', ),
    string(name: 'GIT_REPO', defaultValue: 'git@github.com:cnbc/DevOps.Dynect.APIUI.git', description: 'GIT_REPO', ),
    string(name: 'HOST_REMOTE', defaultValue: 'centos@', description: 'HOST_REMOTE', ),
    string(name: 'APP_SERVERS', defaultValue: '172.30.4.192', description: 'APP_SERVERS', ),
    string(name: 'DIR_REMOTE', defaultValue: '/tmp', description: 'DIR_REMOTE', ),
    string(name: 'USER_KEY', defaultValue: '~/.ssh/oregon-key-pair.pem', description: 'USER_KEY', ),
    string(name: 'SEND_EMAIL', defaultValue: 'u2a9j8h4i4s4s5i0@nbcnewsgroup.slack.com', description: 'SEND_EMAIL', )
   ])
])

node
{
    def dateFormat = new SimpleDateFormat("HH-mm_dd-MM-yyyy")
    def DATE_NOW = new Date()
    DATE_NOW = dateFormat.format(DATE_NOW)
    withCredentials([string(credentialsId: 'SonarQube', variable: 'SONAR')]){
    stage('Set Environment Variables') {
        env.JAVA_HOME='/var/lib/jenkins/tools/hudson.model.JDK/java8'
        env.mvnHome='/var/lib/jenkins/tools/hudson.tasks.Maven_MavenInstallation/maven3.5.2'
        env.NODEPATH='/var/lib/jenkins/tools/jenkins.plugins.nodejs.tools.NodeJSInstallation/Node8/bin'
         // env.GIT_REPO='git@github.com:cnbc/WEB.Phoenix.git'
      //  env.EMAIL='vadim.reznik@nbcuni.com; v7v7m5m0f0v6n7y4@nbcnewsgroup.slack.com'


     }
     stage('Checkout Configs from Git') {
       // Get configs from devops
        git([url: 'git@github.com:cnbc/DevOps.Application.Configs.git', branch: 'master', credentialsId: 'cnbc.deploy.github'])
        sh '''
        hostname
        REPO=`echo ${GIT_REPO} |awk -F/ '{print $2}' | awk -F.git '{print $1}'`
        /bin/mv $REPO  $REPO"_cfg" || true ;
        '''
     }
	    
  stage('Checkout Code From Git') {
    // Uncomment below ONLY if the Jenkins Workspace is polluted
    // sh "rm -r src/*"

    git([url: env.GIT_REPO, branch: env.GIT_BRANCH, credentialsId: 'cnbc.deploy.github'])
      sh '''
        REPO=`echo ${GIT_REPO} |awk -F/ '{print $2}' | awk -F.git '{print $1}'`
        for i in `ls devopsENVconfig|grep -v $REPO`; do rm -fr devopsENVconfig/$i ||true ; done
      '''
    }

    sh "pwd"
    sh "ls"

    stage('Deploy Package to Servers') {
      sh '''
        rm -r ../src
        mkdir ../src
        mv * ../src
        ls ../src
        ls ~/.ssh/
        for i in $APP_SERVERS;
            do (scp -i $USER_KEY -o UserKnownHostsFile=~/.ssh/known_hosts -o 	StrictHostKeyChecking=no \
              -r ../src $HOST_REMOTE${i}:$DIR_REMOTE/ || \
              (echo "FAILED to copy file to $HOST_REMOTE${i}" && exit 1)) && ts=`/bin/date`;
              echo "Transferred [$DEPLOY_PACKAGE] to [$HOST_REMOTE${i}] on ${ts}";
        done;
        for i in $APP_SERVERS
              do
                (ssh -i $USER_KEY -o UserKnownHostsFile=~/.ssh/known_hosts -o StrictHostKeyChecking=no $HOST_REMOTE${i} \
                "sudo mkdir /var/www/html/dynect && sudo rm -r /var/www/html/* && sudo mv /tmp/src/* /var/www/html/ && sudo chmod -R 777 /var/www/html/py/tmp-app-data/" || \
                (echo "FAILED to execute deployment script on $HOST_REMOTE${i}" && exit 1)) && ts=`/bin/date`;
                echo "Ran deployment script on [$HOST_REMOTE${i}] at ${ts}";
              done
      '''
    }

    stage('Send Email notification'){
        notifyThroughEmail('COMPLETED');
    }



   }
}

def notifyThroughEmail(String STAGE= "Default"){
          emailext  (body:"""
					${STAGE}  ${env.JOB_NAME}_${env.BUILD_NUMBER}
          ${env.BUILD_URL}
          ${env.GIT_REPO}_${env.GIT_BRANCH}
					""",
				compressLog: true,
       		 	attachLog: false,
                recipientProviders: [[$class: 'DevelopersRecipientProvider'], [$class: 'RequesterRecipientProvider']],
                subject: "${STAGE}   ${env.JOB_NAME} version #${env.BUILD_NUMBER}  ",
                to: "${env.SEND_EMAIL}");
        }
