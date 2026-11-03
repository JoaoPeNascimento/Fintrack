package com.fintrack.infrastructure;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/** Regra de dependência da Clean Architecture: as camadas internas não conhecem as externas. */
@AnalyzeClasses(packages = "com.fintrack", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses()
            .that().resideInAPackage("com.fintrack.domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "com.fintrack.application..", "com.fintrack.infrastructure..",
                    "org.springframework..", "org.bson..", "com.mongodb..");

    @ArchTest
    static final ArchRule applicationDependsOnlyOnDomain = noClasses()
            .that().resideInAPackage("com.fintrack.application..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "com.fintrack.infrastructure..", "org.springframework..", "org.bson..", "com.mongodb..");

    @ArchTest
    static final ArchRule webDoesNotTouchPersistence = noClasses()
            .that().resideInAPackage("com.fintrack.infrastructure.web..")
            .should().dependOnClassesThat().resideInAPackage("com.fintrack.infrastructure.persistence..");
}
