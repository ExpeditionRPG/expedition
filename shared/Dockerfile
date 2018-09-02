FROM ubuntu:18.04@sha256:72f832c6184b55569be1cd9043e4a80055d55873417ea792d989441f207dd2c7
MAINTAINER Scott Martin <smartin015@gmail.com>
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN apt-get update
RUN apt-get install -y wget gnupg2

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -y google-chrome-stable

RUN apt-get install -y git nodejs tmux npm bash build-essential curl libfontconfig1
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.25.0/install.sh | bash
RUN /bin/bash -l -c 'source ~/.nvm/nvm.sh && nvm install v8.11.3 && nvm alias default v8.11.3'
RUN npm install -g webpack yarn
RUN echo "#!/bin/bash\ncd /volume\ntmux new-session -s dev '/bin/bash'" > /run.sh && chmod a+x /run.sh
ENTRYPOINT /run.sh
