package com.fintrack.infrastructure.persistence.mongo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexDefinition;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    private final MongoTemplate mongoTemplate;

    public MongoConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /** Não grava o campo {@code _class}: as coleções são compartilhadas com documentos legados do Mongoose. */
    @Bean
    static MappingMongoConverter mappingMongoConverter(MongoDatabaseFactory factory, MongoMappingContext context,
                                                       MongoCustomConversions conversions) {
        MappingMongoConverter converter = new MappingMongoConverter(new DefaultDbRefResolver(factory), context);
        converter.setCustomConversions(conversions);
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return converter;
    }

    @EventListener(ApplicationReadyEvent.class)
    void createIndexes() {
        ensureRequiredIndex(UserDocument.COLLECTION, new Index().on("email", Sort.Direction.ASC).unique());
        ensureIndex(CardDocument.COLLECTION, new Index().on("userId", Sort.Direction.ASC).on("createdAt", Sort.Direction.DESC));
        ensureIndex(FixedExpenseDocument.COLLECTION, new Index().on("userId", Sort.Direction.ASC).on("createdAt", Sort.Direction.DESC));
        ensureIndex(ExpenseDocument.COLLECTION, new Index().on("userId", Sort.Direction.ASC).on("date", Sort.Direction.DESC));
        ensureRequiredIndex(ExpenseShareDocument.COLLECTION, new Index().on("ownerId", Sort.Direction.ASC).unique());
        ensureRequiredIndex(ExpenseShareDocument.COLLECTION, new Index().on("token", Sort.Direction.ASC).unique());
        ensureIndex(ExpenseShareDocument.COLLECTION, new Index().on("members.userId", Sort.Direction.ASC));
    }

    /**
     * Índices de que a corretude depende (ex.: e-mail único garante um usuário por conta no upsert).
     * Se não puderem ser criados — por exemplo, há e-mails duplicados — a aplicação não sobe.
     */
    private void ensureRequiredIndex(String collection, IndexDefinition index) {
        try {
            mongoTemplate.indexOps(collection).ensureIndex(index);
        } catch (RuntimeException e) {
            throw new IllegalStateException("Índice obrigatório não pôde ser criado em " + collection
                    + ". Verifique documentos duplicados (backend/deploy/migrations/check-duplicate-users.js).", e);
        }
    }

    private void ensureIndex(String collection, IndexDefinition index) {
        try {
            mongoTemplate.indexOps(collection).ensureIndex(index);
        } catch (RuntimeException e) {
            log.warn("Não foi possível criar índice em {}: {}", collection, e.getMessage());
        }
    }
}
