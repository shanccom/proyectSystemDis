package com.voting.voting.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "election_id", nullable = false)
    private Long electionId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String party;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Candidate() {}

    public Long getId() { return id; }
    public Long getElectionId() { return electionId; }
    public String getName() { return name; }
    public String getParty() { return party; }
    public String getPhotoUrl() { return photoUrl; }
}
