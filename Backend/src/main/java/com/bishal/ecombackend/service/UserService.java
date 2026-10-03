package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.*;
import com.bishal.ecombackend.exception.ResourceNotFoundException;
import com.bishal.ecombackend.mapper.UserMapper;
import com.bishal.ecombackend.model.Address;
import com.bishal.ecombackend.model.Users;
import com.bishal.ecombackend.repo.AddressRepository;
import com.bishal.ecombackend.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo repo;
    private final AddressRepository addressRepository;
    private final PasswordEncoder encoder;
    private final UserMapper mapper;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;

    // --- Authentication Operations ---

    public UserResponse register(UserRegisterRequest request) {
        log.info("Processing registration request for username: {}", request.getUsername());

        Users user = mapper.toEntity(request);
        user.setPassword(encoder.encode(user.getPassword()));
        Users savedUser = repo.save(user);

        log.info("User '{}' registered successfully with ID: {}", savedUser.getUsername(), savedUser.getId());
        return mapper.toResponse(savedUser);
    }

    public AuthResponse verify(UserLoginRequest request) {
        log.info("Authenticating user: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        if (authentication.isAuthenticated()) {
            log.info("User '{}' authenticated successfully. Issuing token.", request.getUsername());
            String token = jwtService.generateToken(request.getUsername());
            Users user = repo.findByUsername(request.getUsername());
            return new AuthResponse(token, user.getUsername(), user.getRole());
        }

        log.warn("Authentication failed for user: {}", request.getUsername());
        throw new BadCredentialsException("Invalid username or password");
    }

    // --- Profile Operations ---

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String username) {
        Users user = getUserByUsername(username);
        List<AddressResponse> addresses = addressRepository
                .findAllByUser_UsernameOrderByIsDefaultDescCreatedAtDesc(username)
                .stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .addresses(addresses)
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        Users user = getUserByUsername(username);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(encoder.encode(request.getPassword()));
        }

        repo.save(user);
        return getProfile(username);
    }

    // --- Address Book Operations ---

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(String username) {
        return addressRepository.findAllByUser_UsernameOrderByIsDefaultDescCreatedAtDesc(username)
                .stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(String username, AddressRequest request) {
        Users user = getUserByUsername(username);
        boolean hasExistingAddresses = !addressRepository.findAllByUser_UsernameOrderByIsDefaultDescCreatedAtDesc(username).isEmpty();

        boolean isDefault = !hasExistingAddresses || Boolean.TRUE.equals(request.getIsDefault());

        if (isDefault) {
            clearPreviousDefault(username);
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .streetAddress(request.getStreetAddress().trim())
                .landmark(request.getLandmark() != null ? request.getLandmark().trim() : null)
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .postalCode(request.getPostalCode().trim())
                .country(request.getCountry() != null && !request.getCountry().isBlank() ? request.getCountry().trim() : "India")
                .isDefault(isDefault)
                .build();

        Address saved = addressRepository.save(address);
        return mapToAddressResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(String username, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUser_Username(addressId, username)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.isDefault()) {
            clearPreviousDefault(username);
            address.setDefault(true);
        }

        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setStreetAddress(request.getStreetAddress().trim());
        address.setLandmark(request.getLandmark() != null ? request.getLandmark().trim() : null);
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        if (request.getCountry() != null && !request.getCountry().isBlank()) {
            address.setCountry(request.getCountry().trim());
        }

        Address updated = addressRepository.save(address);
        return mapToAddressResponse(updated);
    }

    @Transactional
    public AddressResponse setDefaultAddress(String username, UUID addressId) {
        Address address = addressRepository.findByIdAndUser_Username(addressId, username)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        clearPreviousDefault(username);
        address.setDefault(true);
        return mapToAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String username, UUID addressId) {
        Address address = addressRepository.findByIdAndUser_Username(addressId, username)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findAllByUser_UsernameOrderByIsDefaultDescCreatedAtDesc(username);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.getFirst();
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    private void clearPreviousDefault(String username) {
        addressRepository.findByUser_UsernameAndIsDefaultTrue(username).ifPresent(addr -> {
            addr.setDefault(false);
            addressRepository.save(addr);
        });
    }

    private Users getUserByUsername(String username) {
        Users user = repo.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found: " + username);
        }
        return user;
    }

    private AddressResponse mapToAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .streetAddress(address.getStreetAddress())
                .landmark(address.getLandmark())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .formattedAddress(address.toFormattedAddress())
                .build();
    }
}