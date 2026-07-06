package com.voting.voting.event;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class VoteEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    private static final String EXCHANGE = "voting.exchange";
    private static final String ROUTING_KEY = "vote.registered";

    public VoteEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(VoteEvent event) {
        rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, event);
    }
}
