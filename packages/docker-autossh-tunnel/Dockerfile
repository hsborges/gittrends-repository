FROM alpine:3.2

LABEL CREDITS_TO Cagatay Gurturk <cguertuerk@ebay.de>
LABEL MAINTAINER Hudson Borges <hudsonsilbor@gmail.com>

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
RUN apk update
RUN apk add bash openssh-client autossh

RUN rm -rf /var/cache/apk/*
RUN rm -rf /root/.ssh
RUN mkdir /root/.ssh

WORKDIR /root
COPY autossh.sh .
RUN chmod +x autossh.sh

VOLUME [ "/root/ssh" ]

EXPOSE 1-65535

ENV AUTOSSH_PORT=9999

CMD [ "bash", "autossh.sh" ]

