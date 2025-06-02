package com.example.lbf.entities.converters;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class DescuentosConverter implements AttributeConverter<List<Float>, String> {

    private static final String SEPARATOR = ",";

    @Override
    public String convertToDatabaseColumn(List<Float> descuentos) {
        if (descuentos == null || descuentos.isEmpty()) {
            return null;
        }
        
        return descuentos.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(SEPARATOR));
    }

    @Override
    public List<Float> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return new ArrayList<>();
        }
        
        return Arrays.stream(dbData.split(SEPARATOR))
                .map(Float::parseFloat)
                .collect(Collectors.toList());
    }
}