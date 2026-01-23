# ATProto Lexicon Style Guide

This document summarizes the ATProto Lexicon Style Guide rules that are checked by our automated checker. For the complete guide, visit: https://atproto.com/guides/lexicon-style-guide

## Key Style Rules

### 1. Naming Conventions

#### Lexicon IDs (NSIDs)

- **Format**: Reverse-DNS notation (e.g., `org.hypercerts.claim.activity`)
- **Case**: All lowercase
- **Segments**: Use descriptive, concise names
- **Avoid**: Numbers in authority segments, generic names like "item" or "thing"

#### Record Keys

- **Recommendation**: Use `any` for most record keys to allow flexible client-side naming
- **TIDs**: When using TIDs (Timestamp IDs), ensure they're appropriate for the use case
- **Literal keys**: Only use for singleton records or very specific use cases

#### Property Names

- **Format**: camelCase
- **Clarity**: Use clear, descriptive names
- **Avoid**: Abbreviations unless widely understood
- **Consistency**: Use consistent terminology across related lexicons

### 2. Descriptions

#### Lexicon Descriptions

- **Completeness**: Every lexicon should have a clear description
- **Detail**: Explain the purpose and usage
- **Context**: Provide enough information for developers to understand

#### Property Descriptions

- **Required**: All properties should have descriptions
- **Clarity**: Explain what the property represents and how it should be used
- **Format hints**: Include format expectations when relevant

#### Definition Descriptions

- **Coverage**: All definitions (objects, arrays, etc.) should have descriptions
- **Purpose**: Explain the role of the definition in the schema

### 3. Schema Design

#### Type Selection

- **Primitives**: Use appropriate primitive types (string, integer, boolean)
- **Formats**: Apply format constraints (datetime, uri, cid, did, etc.)
- **Refs**: Use refs for reusable types and relationships
- **Unions**: Use unions when a property can be one of several types. All variants in a union must be object or record types (strings/numbers are not allowed directly in unions by ATProto spec).

#### Constraints

- **String lengths**: Always set maxLength for strings
- **maxGraphemes**: Consider using maxGraphemes for user-visible text
- **Array constraints**: Consider maxLength for arrays
- **Required fields**: Mark truly required fields, keep optional what can be optional

#### Blob Handling

- **Size limits**: Always specify maxSize for blobs
- **MIME types**: Specify accepted MIME types with the `accept` property
- **Documentation**: Document blob size limits and types clearly

### 4. Relationships and References

#### Strong References

- **Usage**: Use `com.atproto.repo.strongRef` for references to other records
- **Documentation**: Clearly document what type of record is expected
- **Validation**: Specify the expected lexicon type in the description

#### Arrays of References

- **Consistency**: Use consistent patterns for arrays of references
- **Documentation**: Explain the relationship and cardinality

### 5. Timestamps

#### DateTime Fields

- **Format**: Always use `format: "datetime"` for timestamp fields
- **Naming**: Use clear names like `createdAt`, `updatedAt`, `publishedAt`
- **Requirement**: Mark as required when appropriate
- **Documentation**: Explain when the timestamp should be set

### 6. Common Patterns

#### Created At

- **Standard**: Include a `createdAt` field for records
- **Type**: `string` with `format: "datetime"`
- **Description**: "Client-declared timestamp when this record was originally created"

#### Updated At

- **Usage**: Include `updatedAt` for mutable records
- **Type**: `string` with `format: "datetime"`
- **Description**: "Client-declared timestamp when this record was last updated"

#### Versioning

- **Consideration**: Think about versioning strategy for evolving schemas
- **Migration**: Document breaking changes

### 7. Validation and Constraints

#### String Validation

- **maxLength**: Always set for strings (prevents abuse)
- **maxGraphemes**: Use for user-facing text (better UX for internationalization)
- **Patterns**: Use regex patterns when format validation is needed

#### Number Validation

- **Range**: Consider minimum and maximum values
- **Integers**: Use integer type when fractional values don't make sense

#### Required vs Optional

- **Conservative**: Only mark as required if truly necessary
- **Flexibility**: Allow optional fields for future extensibility
- **Documentation**: Explain when optional fields should be used

### 8. Documentation Best Practices

#### Inline Documentation

- **Comprehensive**: Document all types, properties, and constraints
- **Examples**: Include example values in descriptions when helpful
- **Context**: Explain relationships and dependencies

#### External Documentation

- **README**: Maintain high-level documentation
- **Migration guides**: Document schema changes and migrations
- **Examples**: Provide usage examples

### 9. Lexicon Organization

#### File Structure

- **Grouping**: Group related lexicons in namespaces
- **Definitions**: Use `defs.json` for shared definitions
- **Modularity**: Keep lexicons focused and modular

#### Dependencies

- **Explicit**: Clearly document dependencies on other lexicons
- **Minimal**: Minimize cross-lexicon dependencies
- **Standard**: Use standard ATProto lexicons when appropriate

### 10. Security and Privacy

#### Data Sensitivity

- **PII**: Be careful with personally identifiable information
- **Access control**: Consider who can read/write records
- **Validation**: Validate all input data

#### Size Limits

- **DoS prevention**: Set appropriate size limits on all fields
- **Blob limits**: Be conservative with blob size limits
- **Array limits**: Limit array sizes to prevent abuse

## Automated Checks

The `style:check` script checks for:

1. ✅ All lexicons have descriptions
2. ✅ All properties have descriptions
3. ✅ All definitions have descriptions
4. ✅ String properties have maxLength constraints
5. ✅ Blob properties have maxSize and accept properties
6. ✅ DateTime fields use the correct format
7. ✅ Property names use camelCase
8. ✅ Required fields are properly marked
9. ✅ StrongRef usage is documented
10. ✅ Lexicon IDs follow naming conventions

## Running the Checker

```bash
npm run style:check
```

This will check all lexicons in the `lexicons/` directory and report any style guide violations.
